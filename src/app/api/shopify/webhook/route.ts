import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyShopifyWebhookHmac, extractOrderPhone, type ShopifyOrderPayload } from "@/lib/shopify";
import { sendTemplateMessage } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const shopDomain = request.headers.get("x-shopify-shop-domain");

  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiSecret || !verifyShopifyWebhookHmac(rawBody, hmacHeader, apiSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  if (!shopDomain) return NextResponse.json({ error: "Missing shop domain" }, { status: 400 });

  const admin = createAdminClient();
  const { data: workspace } = await admin
    .from("workspaces")
    .select("id, whatsapp_phone_number_id, whatsapp_access_token, order_confirmation_template_id")
    .eq("shopify_shop_domain", shopDomain)
    .maybeSingle();
  if (!workspace) return NextResponse.json({ received: true }); // a shop we don't recognize — nothing to do

  let order: ShopifyOrderPayload;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!workspace.order_confirmation_template_id) return NextResponse.json({ received: true }); // no template picked yet
  const phone = extractOrderPhone(order);
  if (!phone) return NextResponse.json({ received: true });

  const { data: template } = await admin
    .from("templates")
    .select("meta_template_name, language, body_text")
    .eq("id", workspace.order_confirmation_template_id)
    .single();
  if (!template) return NextResponse.json({ received: true });

  const { data: contact } = await admin
    .from("contacts")
    .upsert(
      { workspace_id: workspace.id, phone, name: order.customer?.first_name ?? null, language: template.language, source: "shopify_order" },
      { onConflict: "workspace_id,channel,phone", ignoreDuplicates: false },
    )
    .select("id")
    .maybeSingle();

  const placeholderCount = (template.body_text?.match(/\{\{\d+\}\}/g) ?? []).length;
  const bodyParams = placeholderCount > 0 ? [order.customer?.first_name || "there", order.name ?? `#${order.order_number ?? ""}`].slice(0, placeholderCount) : undefined;

  try {
    const { metaMessageId } = await sendTemplateMessage({
      workspace,
      to: phone,
      templateName: template.meta_template_name,
      language: template.language,
      bodyParams,
    });
    if (contact?.id) {
      await admin.from("messages").insert({
        workspace_id: workspace.id,
        contact_id: contact.id,
        direction: "outbound",
        meta_message_id: metaMessageId,
        status: "sent",
      });
    }
  } catch {
    // A failed order-confirmation send shouldn't make Shopify retry the webhook forever — 200 either way.
  }

  return NextResponse.json({ received: true });
}

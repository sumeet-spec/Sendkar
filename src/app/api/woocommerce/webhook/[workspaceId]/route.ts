import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWooWebhookSignature, extractWooOrderPhone, type WooOrderPayload } from "@/lib/woocommerce";
import { sendTemplateMessage } from "@/lib/whatsapp";
import { attributeOrder } from "@/lib/attribution";

/** The workspace id in the URL isn't secret by itself — the HMAC signature, keyed by a secret only that workspace's merchant set, is the actual auth. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const rawBody = await request.text();
  const signature = request.headers.get("x-wc-webhook-signature");

  const admin = createAdminClient();
  const { data: workspace } = await admin
    .from("workspaces")
    .select("id, whatsapp_phone_number_id, whatsapp_access_token, woocommerce_webhook_secret, order_confirmation_template_id")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!workspace?.woocommerce_webhook_secret) return NextResponse.json({ error: "Not configured" }, { status: 404 });

  if (!verifyWooWebhookSignature(rawBody, signature, workspace.woocommerce_webhook_secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let order: WooOrderPayload;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = extractWooOrderPhone(order);
  if (!phone) return NextResponse.json({ received: true });

  // ignoreDuplicates: false (an update on conflict) is deliberate — see the
  // Shopify webhook for why this is atomic and race-safe where a
  // select-then-insert wouldn't be.
  const { data: contact } = await admin
    .from("contacts")
    .upsert(
      { workspace_id: workspace.id, phone, name: order.billing?.first_name ?? null, source: "woocommerce_order" },
      { onConflict: "workspace_id,channel,phone", ignoreDuplicates: false },
    )
    .select("id")
    .maybeSingle();

  const orderDate = new Date();
  const totalAmount = Number.parseFloat(order.total ?? "0") || 0;
  if (contact?.id) {
    const attributedCampaignId = await attributeOrder(admin, contact.id, orderDate);
    await admin.from("orders").upsert(
      {
        workspace_id: workspace.id,
        contact_id: contact.id,
        source: "woocommerce",
        external_order_id: order.id != null ? String(order.id) : null,
        order_label: order.number ? `#${order.number}` : null,
        total_amount: totalAmount,
        currency: order.currency ?? "INR",
        attributed_campaign_id: attributedCampaignId,
      },
      { onConflict: "workspace_id,source,external_order_id", ignoreDuplicates: true },
    );
  }

  if (!workspace.order_confirmation_template_id) return NextResponse.json({ received: true });

  const { data: template } = await admin
    .from("templates")
    .select("meta_template_name, language, body_text")
    .eq("id", workspace.order_confirmation_template_id)
    .single();
  if (!template) return NextResponse.json({ received: true });

  const placeholderCount = (template.body_text?.match(/\{\{\d+\}\}/g) ?? []).length;
  const bodyParams = placeholderCount > 0 ? [order.billing?.first_name || "there", order.number ?? ""].slice(0, placeholderCount) : undefined;

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
    // Same posture as Shopify's webhook — don't make WooCommerce retry forever over a send failure.
  }

  return NextResponse.json({ received: true });
}

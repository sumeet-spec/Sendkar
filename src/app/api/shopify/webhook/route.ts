import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyShopifyWebhookHmac, extractOrderPhone, extractCheckoutPhone,
  type ShopifyOrderPayload, type ShopifyCheckoutPayload,
} from "@/lib/shopify";
import { sendTemplateMessage } from "@/lib/whatsapp";
import { attributeOrder } from "@/lib/attribution";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const shopDomain = request.headers.get("x-shopify-shop-domain");
  const topic = request.headers.get("x-shopify-topic");

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

  // ── Checkout events — abandoned-cart tracking, no message sent from here ──
  // (the recovery nudge itself is a sequence step, processed by the
  // sequences cron once the cart's been open long enough to call it
  // abandoned — this route only ever records the cart's current state).
  if (topic === "checkouts/create" || topic === "checkouts/update") {
    let checkout: ShopifyCheckoutPayload;
    try {
      checkout = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (!checkout.token) return NextResponse.json({ received: true });

    const phone = extractCheckoutPhone(checkout);
    let contactId: string | null = null;
    if (phone) {
      const { data: contact } = await admin
        .from("contacts")
        .upsert(
          { workspace_id: workspace.id, phone, name: checkout.customer?.first_name ?? null, source: "shopify_checkout" },
          { onConflict: "workspace_id,channel,phone", ignoreDuplicates: false },
        )
        .select("id")
        .maybeSingle();
      contactId = contact?.id ?? null;
    }

    if (checkout.completed_at) {
      // Converted to an order — orders/create will log the actual order; this
      // cart's job is done, so it shouldn't also fire a recovery nudge later.
      await admin.from("carts").update({ status: "recovered" }).eq("workspace_id", workspace.id).eq("shopify_checkout_id", checkout.token);
    } else {
      await admin.from("carts").upsert(
        {
          workspace_id: workspace.id,
          contact_id: contactId,
          shopify_checkout_id: checkout.token,
          checkout_url: checkout.abandoned_checkout_url ?? null,
          total_amount: Number.parseFloat(checkout.total_price ?? "0") || 0,
          currency: checkout.currency ?? "INR",
          status: "open",
        },
        { onConflict: "workspace_id,shopify_checkout_id", ignoreDuplicates: false },
      );
    }
    return NextResponse.json({ received: true });
  }

  let order: ShopifyOrderPayload;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = extractOrderPhone(order);
  if (!phone) return NextResponse.json({ received: true }); // no way to link this order to a contact

  // Revenue tracking: find or create the contact, then log the order and
  // attribute it to whichever campaign this contact was most recently sent —
  // independent of whether an order-confirmation template is even set up.
  // ignoreDuplicates: false (an update on conflict) is deliberate — it's
  // what makes RETURNING give back an existing contact's id too, not just a
  // newly-created one, and it does it atomically instead of a racy
  // select-then-insert.
  const { data: contact } = await admin
    .from("contacts")
    .upsert(
      { workspace_id: workspace.id, phone, name: order.customer?.first_name ?? null, source: "shopify_order" },
      { onConflict: "workspace_id,channel,phone", ignoreDuplicates: false },
    )
    .select("id")
    .maybeSingle();

  const orderDate = new Date();
  const totalAmount = Number.parseFloat(order.total_price ?? "0") || 0;
  if (contact?.id) {
    // Belt-and-suspenders against the checkouts/update completed_at path above:
    // any of this contact's still-open carts are done the moment a real order
    // lands, regardless of which webhook noticed first.
    await admin.from("carts").update({ status: "recovered" }).eq("workspace_id", workspace.id).eq("contact_id", contact.id).eq("status", "open");

    const attributedCampaignId = await attributeOrder(admin, contact.id, orderDate);
    await admin.from("orders").upsert(
      {
        workspace_id: workspace.id,
        contact_id: contact.id,
        source: "shopify",
        external_order_id: order.id != null ? String(order.id) : null,
        order_label: order.name ?? (order.order_number != null ? `#${order.order_number}` : null),
        total_amount: totalAmount,
        currency: order.currency ?? "INR",
        attributed_campaign_id: attributedCampaignId,
      },
      { onConflict: "workspace_id,source,external_order_id", ignoreDuplicates: true },
    );
  }

  if (!workspace.order_confirmation_template_id) return NextResponse.json({ received: true }); // no confirmation template picked yet

  const { data: template } = await admin
    .from("templates")
    .select("meta_template_name, language, body_text")
    .eq("id", workspace.order_confirmation_template_id)
    .single();
  if (!template) return NextResponse.json({ received: true });

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

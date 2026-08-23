import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/whatsapp";
import { dispatchOutboundWebhooks } from "@/lib/outboundWebhooks";

/**
 * Shared inbound webhook for Instagram DMs and Facebook Messenger — Meta's
 * Messenger Platform payload shape is identical for both, differing only
 * in the top-level `object` field ("instagram" vs "page"). Previously
 * Instagram had a send function (lib/instagram.ts) but NO way to receive
 * anything: no contact creation, no 24h-window tracking, nothing. This is
 * what makes both channels genuinely two-way instead of send-only.
 *
 * Signature verification reuses verifyWebhookSignature from lib/whatsapp —
 * Meta signs every webhook for a given App with the same app secret
 * regardless of which product (WhatsApp, Instagram, Messenger) it's for.
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Reuses the WhatsApp webhook's verify token — this is an App-level value
  // in Meta's dashboard, not something that needs to differ per product.
  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

interface MessagingEvent {
  sender?: { id?: string };
  message?: { mid?: string; text?: string };
}

interface WebhookPayload {
  object?: "instagram" | "page" | string;
  entry?: Array<{ id?: string; messaging?: MessagingEvent[] }>;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!(await verifyWebhookSignature(rawBody, signature))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const channel: "instagram" | "messenger" = payload.object === "instagram" ? "instagram" : "messenger";
  const admin = createAdminClient();

  for (const entry of payload.entry ?? []) {
    const pageId = entry.id;
    if (!pageId) continue;

    const credColumn = channel === "instagram" ? "instagram_page_id" : "messenger_page_id";
    const { data: workspace } = await admin.from("workspaces").select("id").eq(credColumn, pageId).maybeSingle();
    if (!workspace) continue; // a page we don't recognize

    for (const event of entry.messaging ?? []) {
      const senderId = event.sender?.id;
      if (!senderId || !event.message?.text) continue; // skip delivery/read receipts and non-text events for now

      const { data: existing } = await admin
        .from("contacts")
        .select("id")
        .eq("workspace_id", workspace.id)
        .eq("channel", channel)
        .eq("phone", senderId)
        .maybeSingle();

      let contactId = existing?.id as string | undefined;
      let isNewContact = false;
      if (!contactId) {
        const { data: created } = await admin
          .from("contacts")
          .insert({ workspace_id: workspace.id, phone: senderId, channel, source: "inbound_reply" })
          .select("id")
          .single();
        contactId = created?.id;
        isNewContact = Boolean(contactId);
      }
      if (!contactId) continue;

      await admin.from("messages").insert({
        workspace_id: workspace.id,
        contact_id: contactId,
        direction: "inbound",
        body: event.message.text,
        meta_message_id: event.message.mid ?? null,
        status: "delivered",
        channel,
      });

      await admin
        .from("contacts")
        .update({ session_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
        .eq("id", contactId);

      const wsId = workspace.id;
      if (isNewContact) after(() => dispatchOutboundWebhooks(wsId, "contact.created", { contactId, channel }));
      after(() => dispatchOutboundWebhooks(wsId, "message.received", { contactId, channel, body: event.message!.text }));
    }
  }

  return NextResponse.json({ received: true });
}

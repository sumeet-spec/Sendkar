import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/whatsapp";

/**
 * Meta's WhatsApp webhook — receives delivery-status updates and inbound
 * messages for every workspace's connected number. No user session exists
 * here (Meta is calling in, not a logged-in customer), so this uses the
 * service-role client and verifies the request via HMAC signature instead
 * of a login — same "the signature IS the auth" posture as Continuum's SES
 * event route, just WhatsApp's simpler single-secret HMAC instead of SNS's
 * certificate-chain verification.
 */

// ── GET: Meta's one-time verification handshake ──────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// ── Payload shapes (only the fields read) ─────────────────────────────────────

interface WebhookPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
        messages?: Array<{ from?: string; id?: string; type?: string; text?: { body?: string } }>;
        statuses?: Array<{
          id?: string;
          status?: "sent" | "delivered" | "read" | "failed";
          recipient_id?: string;
          errors?: Array<{ message?: string }>;
        }>;
      };
    }>;
  }>;
}

const STATUS_MAP: Record<string, "sent" | "delivered" | "read" | "failed"> = {
  sent: "sent",
  delivered: "delivered",
  read: "read",
  failed: "failed",
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  const verified = await verifyWebhookSignature(rawBody, signature);
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const admin = createAdminClient();

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;

      const phoneNumberId = value.metadata?.phone_number_id ?? null;
      let workspaceId: string | null = null;
      if (phoneNumberId) {
        const { data: ws } = await admin
          .from("workspaces")
          .select("id")
          .eq("whatsapp_phone_number_id", phoneNumberId)
          .maybeSingle();
        workspaceId = ws?.id ?? null;
      }

      // Log the raw event regardless — untrusted-but-verified data, kept for
      // debugging, never treated as an instruction.
      await admin.from("webhook_events").insert({
        workspace_id: workspaceId,
        event_type: change.field ?? "unknown",
        raw_payload: value,
      });

      if (!workspaceId) continue; // event for a phone number we don't recognize — nothing more to do

      // ── Delivery status updates ────────────────────────────────────────────
      for (const status of value.statuses ?? []) {
        const mapped = status.status ? STATUS_MAP[status.status] : undefined;
        if (!status.id || !mapped) continue;

        await admin
          .from("campaign_recipients")
          .update({ status: mapped, error: status.errors?.[0]?.message ?? null })
          .eq("meta_message_id", status.id);

        await admin
          .from("messages")
          .update({ status: mapped })
          .eq("meta_message_id", status.id);
      }

      // ── Inbound messages ───────────────────────────────────────────────────
      for (const msg of value.messages ?? []) {
        if (!msg.from) continue;

        const { data: contact } = await admin
          .from("contacts")
          .select("id")
          .eq("workspace_id", workspaceId)
          .eq("phone", msg.from)
          .maybeSingle();

        let contactId = contact?.id as string | undefined;
        if (!contactId) {
          const profileName = value.contacts?.find((c) => c.wa_id === msg.from)?.profile?.name ?? null;
          const { data: created } = await admin
            .from("contacts")
            .insert({ workspace_id: workspaceId, phone: msg.from, name: profileName, source: "inbound_reply" })
            .select("id")
            .single();
          contactId = created?.id;
        }
        if (!contactId) continue;

        await admin.from("messages").insert({
          workspace_id: workspaceId,
          contact_id: contactId,
          direction: "inbound",
          body: msg.text?.body ?? `[${msg.type ?? "unsupported"} message]`,
          meta_message_id: msg.id ?? null,
          status: "delivered",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}

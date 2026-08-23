import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature, sendSessionMessage, isOptOutMessage, isOptInMessage, OPT_OUT_CONFIRMATION } from "@/lib/whatsapp";
import { dispatchOutboundWebhooks } from "@/lib/outboundWebhooks";

/**
 * Meta's WhatsApp webhook — receives delivery-status updates, inbound
 * messages, and template review outcomes for every workspace's connected
 * number/WABA. No user session exists here (Meta is calling in, not a
 * logged-in customer), so this uses the service-role client and verifies
 * the request via HMAC signature instead of a login — same "the signature
 * IS the auth" posture as Continuum's SES event route, just WhatsApp's
 * simpler single-secret HMAC instead of SNS's certificate-chain verification.
 *
 * Anything dispatched via `after()` runs once the response has been sent
 * back to Meta but keeps the serverless function alive until it finishes —
 * `void someAsyncCall()` alone does NOT guarantee that on Vercel: the
 * function can freeze the instant the response goes out, silently dropping
 * whatever that fire-and-forget call hadn't finished yet.
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
    id?: string; // WABA id for template events, unrelated to phone_number_id
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
        // message_template_status_update fields
        event?: string;
        message_template_name?: string;
        message_template_language?: string;
        reason?: string;
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

const TEMPLATE_STATUS_MAP: Record<string, "approved" | "rejected" | "pending"> = {
  APPROVED: "approved",
  REJECTED: "rejected",
  PENDING: "pending",
  FLAGGED: "rejected",
  PAUSED: "rejected",
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

      // ── Template review outcome — a WABA-level event, not phone-number-scoped ──
      if (change.field === "message_template_status_update" && value.message_template_name) {
        const mapped = value.event ? TEMPLATE_STATUS_MAP[value.event] : undefined;
        if (mapped && entry.id) {
          const { data: ws } = await admin.from("workspaces").select("id").eq("whatsapp_waba_id", entry.id).maybeSingle();
          if (ws) {
            let query = admin
              .from("templates")
              .update({ status: mapped, rejection_reason: value.reason ?? null })
              .eq("workspace_id", ws.id)
              .eq("meta_template_name", value.message_template_name);
            if (value.message_template_language) query = query.eq("language", value.message_template_language);
            await query;
          }
        }
        continue;
      }

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
        let isNewContact = false;
        if (!contactId) {
          const profileName = value.contacts?.find((c) => c.wa_id === msg.from)?.profile?.name ?? null;
          const { data: created } = await admin
            .from("contacts")
            .insert({ workspace_id: workspaceId, phone: msg.from, name: profileName, source: "inbound_reply" })
            .select("id")
            .single();
          contactId = created?.id;
          isNewContact = Boolean(contactId);
        }
        if (!contactId) continue;

        const inboundBody = msg.text?.body ?? `[${msg.type ?? "unsupported"} message]`;

        await admin.from("messages").insert({
          workspace_id: workspaceId,
          contact_id: contactId,
          direction: "inbound",
          body: inboundBody,
          meta_message_id: msg.id ?? null,
          status: "delivered",
        });

        // Every inbound message resets the 24h customer-service window —
        // this is what the reply UI and send-time guard both check against.
        await admin
          .from("contacts")
          .update({ session_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
          .eq("id", contactId);

        const wsId = workspaceId;
        if (isNewContact) {
          after(() => dispatchOutboundWebhooks(wsId, "contact.created", { contactId, phone: msg.from }));
        }
        after(() => dispatchOutboundWebhooks(wsId, "message.received", { contactId, phone: msg.from, body: inboundBody }));

        // ── Opt-out / opt-in — a documented, code-enforced unsubscribe path ────
        let handledAsComplianceKeyword = false;
        if (msg.text?.body && isOptOutMessage(msg.text.body)) {
          await admin.from("contacts").update({ opted_out: true }).eq("id", contactId);
          const { data: ws } = await admin
            .from("workspaces")
            .select("whatsapp_phone_number_id, whatsapp_access_token")
            .eq("id", workspaceId)
            .single();
          if (ws) {
            try {
              const { metaMessageId } = await sendSessionMessage({ workspace: ws, to: msg.from, body: OPT_OUT_CONFIRMATION });
              await admin.from("messages").insert({
                workspace_id: workspaceId,
                contact_id: contactId,
                direction: "outbound",
                body: OPT_OUT_CONFIRMATION,
                meta_message_id: metaMessageId,
                status: "sent",
              });
            } catch {
              // Confirmation failing shouldn't block the opt-out itself from taking effect.
            }
          }
          handledAsComplianceKeyword = true;
        } else if (msg.text?.body && isOptInMessage(msg.text.body)) {
          await admin.from("contacts").update({ opted_out: false }).eq("id", contactId);
          handledAsComplianceKeyword = true;
        }

        // ── Keyword-triggered auto-reply ─────────────────────────────────────
        if (!handledAsComplianceKeyword && msg.text?.body) {
          const normalized = msg.text.body.trim().toLowerCase();
          const { data: automations } = await admin
            .from("automations")
            .select("trigger_keyword, match_type, reply_body")
            .eq("workspace_id", workspaceId)
            .eq("is_active", true);

          const matched = (automations ?? []).find((a) =>
            a.match_type === "exact" ? normalized === a.trigger_keyword : normalized.includes(a.trigger_keyword),
          );

          if (matched) {
            const { data: ws } = await admin
              .from("workspaces")
              .select("whatsapp_phone_number_id, whatsapp_access_token")
              .eq("id", workspaceId)
              .single();

            if (ws) {
              try {
                const { metaMessageId } = await sendSessionMessage({ workspace: ws, to: msg.from, body: matched.reply_body });
                await admin.from("messages").insert({
                  workspace_id: workspaceId,
                  contact_id: contactId,
                  direction: "outbound",
                  body: matched.reply_body,
                  meta_message_id: metaMessageId,
                  status: "sent",
                });
              } catch {
                // Automation misfires (e.g. outside the 24h session window) shouldn't break webhook processing.
              }
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

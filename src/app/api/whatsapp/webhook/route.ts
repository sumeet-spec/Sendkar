import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyWebhookSignature, sendSessionMessage, sendButtonsMessage, sendListMessage,
  isOptOutMessage, isOptInMessage, OPT_OUT_CONFIRMATION,
  type InteractiveButton, type InteractiveListSection,
} from "@/lib/whatsapp";
import { dispatchOutboundWebhooks } from "@/lib/outboundWebhooks";
import { syncKlaviyoProfile } from "@/lib/klaviyo";
import { resolveNumberCredentials } from "@/lib/whatsappNumbers";
import { classifyInboundMessage } from "@/lib/ai";
import { isStatusRegression } from "@/lib/messageStatus";
import { isWithinBusinessHours } from "@/lib/businessHours";
import { pickAssignee } from "@/lib/assignment";
import { enrollContactInSequence } from "@/lib/sequences";
import { parseCallWebhookEvent } from "@/lib/calling";
import { matchFlowBranch, type FlowBranch } from "@/lib/flowBranching";

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
        messages?: Array<{
          from?: string; id?: string; type?: string; text?: { body?: string };
          // Present only on the first message of a click-to-WhatsApp-ad conversation.
          referral?: { source_id?: string; headline?: string; ctwa_clid?: string };
          reaction?: { message_id?: string; emoji?: string };
          interactive?: {
            type?: "button_reply" | "list_reply" | "nfm_reply";
            button_reply?: { id?: string; title?: string };
            list_reply?: { id?: string; title?: string };
            nfm_reply?: { response_json?: string; body?: string; name?: string };
          };
        }>;
        statuses?: Array<{
          id?: string;
          status?: "sent" | "delivered" | "read" | "failed";
          recipient_id?: string;
          errors?: Array<{ message?: string }>;
        }>;
        // Call events (WhatsApp Calling API) — field name/shape per Meta's
        // documented "calls" webhook object; unverified against a live
        // calling-enabled WABA since none exists to test against yet.
        calls?: Array<{ id?: string; from?: string; status?: string; timestamp?: string }>;
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

// Extracted to src/lib/messageStatus.ts so the regression rule is unit-
// testable without going through the webhook route's request handling.

const TEMPLATE_STATUS_MAP: Record<string, "approved" | "rejected" | "pending"> = {
  APPROVED: "approved",
  REJECTED: "rejected",
  PENDING: "pending",
  FLAGGED: "rejected",
  PAUSED: "rejected",
};

interface FlowStepRow {
  step_order: number;
  message_body: string;
  branches: FlowBranch[];
  default_next_step_order: number | null;
  message_type: "text" | "buttons" | "list";
  interactive_payload: { buttons?: InteractiveButton[]; buttonText?: string; sections?: InteractiveListSection[] } | null;
  capture_variable: string | null;
}

/**
 * Sends a free-text reply and logs it, sharing the same try/catch shape
 * across opt-out confirmations, flow steps, and automations. `numberId` is
 * the registered secondary number the inbound message arrived on, if any —
 * a reply must go out from the SAME number the contact is talking to, not
 * silently fall back to the workspace's default.
 */
async function sendAndLog(
  admin: ReturnType<typeof createAdminClient>,
  workspaceId: string,
  contactId: string,
  to: string,
  body: string,
  numberId: string | null = null,
): Promise<boolean> {
  const { data: ws } = await admin
    .from("workspaces")
    .select("id, whatsapp_phone_number_id, whatsapp_access_token")
    .eq("id", workspaceId)
    .single();
  if (!ws) return false;
  const creds = await resolveNumberCredentials(ws, numberId);
  try {
    const { metaMessageId } = await sendSessionMessage({ workspace: creds, to, body });
    await admin.from("messages").insert({
      workspace_id: workspaceId,
      contact_id: contactId,
      direction: "outbound",
      body,
      meta_message_id: metaMessageId,
      status: "sent",
    });
    await clearSendFailure(admin, workspaceId);
    return true;
  } catch (err) {
    // Send failing (e.g. outside the 24h session window) shouldn't break webhook
    // processing — but it also can't just vanish. Flows, automations, sequences,
    // and away-messages all go through here with no other UI surface, so a dead
    // token would otherwise fail silently forever with nothing telling the
    // business owner their automations stopped replying.
    await recordSendFailure(admin, workspaceId, err);
    return false;
  }
}

async function recordSendFailure(admin: ReturnType<typeof createAdminClient>, workspaceId: string, err: unknown) {
  await admin
    .from("workspaces")
    .update({ whatsapp_last_send_error: err instanceof Error ? err.message : "Send failed.", whatsapp_last_send_error_at: new Date().toISOString() })
    .eq("id", workspaceId);
}

async function clearSendFailure(admin: ReturnType<typeof createAdminClient>, workspaceId: string) {
  await admin
    .from("workspaces")
    .update({ whatsapp_last_send_error: null, whatsapp_last_send_error_at: null })
    .eq("id", workspaceId)
    .not("whatsapp_last_send_error", "is", null);
}

/** Same shape as sendAndLog, but for a flow step that's a button or list message instead of plain text. */
async function sendFlowStepAndLog(
  admin: ReturnType<typeof createAdminClient>,
  workspaceId: string,
  contactId: string,
  to: string,
  step: FlowStepRow,
  numberId: string | null = null,
): Promise<boolean> {
  const { data: ws } = await admin
    .from("workspaces")
    .select("id, whatsapp_phone_number_id, whatsapp_access_token")
    .eq("id", workspaceId)
    .single();
  if (!ws) return false;
  const creds = await resolveNumberCredentials(ws, numberId);
  try {
    const metaMessageId = step.message_type === "buttons"
      ? (await sendButtonsMessage({ workspace: creds, to, bodyText: step.message_body, buttons: step.interactive_payload?.buttons ?? [] })).metaMessageId
      : (await sendListMessage({ workspace: creds, to, bodyText: step.message_body, buttonText: step.interactive_payload?.buttonText ?? "Choose", sections: step.interactive_payload?.sections ?? [] })).metaMessageId;
    await admin.from("messages").insert({
      workspace_id: workspaceId,
      contact_id: contactId,
      direction: "outbound",
      body: step.message_body,
      meta_message_id: metaMessageId,
      status: "sent",
    });
    await clearSendFailure(admin, workspaceId);
    return true;
  } catch (err) {
    await recordSendFailure(admin, workspaceId, err);
    return false;
  }
}

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
      let matchedNumberId: string | null = null; // set only when the match was a secondary number, not the workspace's default
      if (phoneNumberId) {
        const { data: ws } = await admin
          .from("workspaces")
          .select("id")
          .eq("whatsapp_phone_number_id", phoneNumberId)
          .maybeSingle();
        workspaceId = ws?.id ?? null;

        if (!workspaceId) {
          // Not the default number — check registered secondary numbers.
          const { data: number } = await admin
            .from("whatsapp_numbers")
            .select("id, workspace_id")
            .eq("phone_number_id", phoneNumberId)
            .maybeSingle();
          workspaceId = number?.workspace_id ?? null;
          matchedNumberId = number?.id ?? null;
        }
      }

      // Log the raw event regardless — untrusted-but-verified data, kept for
      // debugging, never treated as an instruction.
      await admin.from("webhook_events").insert({
        workspace_id: workspaceId,
        event_type: change.field ?? "unknown",
        raw_payload: value,
      });

      if (!workspaceId) continue; // event for a phone number we don't recognize — nothing more to do

      // ── Call events — log-only for now; see lib/calling.ts for why placing
      // or answering a call with real audio isn't implemented. ─────────────
      for (const call of parseCallWebhookEvent(value)) {
        const { data: contact } = await admin
          .from("contacts")
          .select("id")
          .eq("workspace_id", workspaceId)
          .eq("phone", call.from)
          .maybeSingle();

        if (call.status === "ringing") {
          await admin.from("calls").insert({
            workspace_id: workspaceId,
            contact_id: contact?.id ?? null,
            direction: "inbound",
            status: "ringing",
            meta_call_id: call.callId,
            started_at: call.timestamp,
          });
        } else {
          const mappedStatus = call.status === "connected" ? "connected" : call.status === "missed" ? "missed" : "ended";
          await admin.from("calls").update({ status: mappedStatus, ended_at: call.timestamp }).eq("meta_call_id", call.callId);
        }
      }

      // ── Delivery status updates ────────────────────────────────────────────
      for (const status of value.statuses ?? []) {
        const mapped = status.status ? STATUS_MAP[status.status] : undefined;
        if (!status.id || !mapped) continue;

        const { data: recipientRow } = await admin
          .from("campaign_recipients")
          .select("status")
          .eq("meta_message_id", status.id)
          .maybeSingle();
        if (recipientRow && !isStatusRegression(recipientRow.status, mapped)) {
          await admin
            .from("campaign_recipients")
            .update({ status: mapped, error: status.errors?.[0]?.message ?? null })
            .eq("meta_message_id", status.id);
        }

        const { data: messageRow } = await admin
          .from("messages")
          .select("status")
          .eq("meta_message_id", status.id)
          .maybeSingle();
        if (messageRow && !isStatusRegression(messageRow.status, mapped)) {
          await admin
            .from("messages")
            .update({ status: mapped })
            .eq("meta_message_id", status.id);
        }
      }

      // ── Inbound messages ───────────────────────────────────────────────────
      for (const msg of value.messages ?? []) {
        if (!msg.from) continue;

        // A reaction targets an existing message by its wamid — it isn't a
        // new message in its own right, so it updates that row and moves on
        // without touching the contact/session/automation machinery below.
        if (msg.type === "reaction" && msg.reaction?.message_id) {
          await admin
            .from("messages")
            .update({ reaction: msg.reaction.emoji || null })
            .eq("workspace_id", workspaceId)
            .eq("meta_message_id", msg.reaction.message_id);
          continue;
        }

        const { data: contact } = await admin
          .from("contacts")
          .select("id, session_expires_at")
          .eq("workspace_id", workspaceId)
          .eq("phone", msg.from)
          .maybeSingle();

        // Captured BEFORE this message extends the session below — this is
        // what tells the away-message check whether this is the start of a
        // fresh conversation (worth greeting) or a reply mid-conversation
        // (the customer already knows we're here, don't repeat it).
        const hadActiveSessionBeforeThisMessage = Boolean(
          contact?.session_expires_at && new Date(contact.session_expires_at) > new Date(),
        );

        let contactId = contact?.id as string | undefined;
        let isNewContact = false;
        let profileNameForNewContact: string | null = null;
        if (!contactId) {
          profileNameForNewContact = value.contacts?.find((c) => c.wa_id === msg.from)?.profile?.name ?? null;
          const { data: created } = await admin
            .from("contacts")
            .insert({
              workspace_id: workspaceId,
              phone: msg.from,
              name: profileNameForNewContact,
              // whatsapp_number_id is null when this is the workspace's default number —
              // only set for a contact whose first message arrived on a registered secondary number.
              whatsapp_number_id: matchedNumberId,
              // Only present when this contact's first message came from clicking a
              // click-to-WhatsApp ad — real ad attribution, captured once, at the source.
              ctwa_clid: msg.referral?.ctwa_clid ?? null,
              ad_source_id: msg.referral?.source_id ?? null,
              ad_headline: msg.referral?.headline ?? null,
              source: msg.referral ? "ctwa_ad" : "inbound_reply",
            })
            .select("id")
            .single();
          contactId = created?.id;
          isNewContact = Boolean(contactId);
        }
        if (!contactId) continue;

        // A completed WhatsApp Flow — matched back to its send by the
        // flow_token Meta echoes inside the response JSON, not by contact
        // (a contact could in principle complete more than one flow send).
        if (msg.type === "interactive" && msg.interactive?.type === "nfm_reply" && msg.interactive.nfm_reply?.response_json) {
          let parsed: Record<string, unknown> = {};
          try {
            parsed = JSON.parse(msg.interactive.nfm_reply.response_json);
          } catch {
            // Malformed response JSON — nothing to correlate, fall through to logging it as a plain message below.
          }
          // Meta's webhook delivery retries on a slow/failed response — a
          // retried delivery for this exact wamid must not re-mark the flow
          // completed a second time or double-extend the session window.
          const { data: insertedForm } = await admin
            .from("messages")
            .upsert(
              { workspace_id: workspaceId, contact_id: contactId, direction: "inbound", body: `[Form completed: ${msg.interactive.nfm_reply.name ?? "flow"}]`, meta_message_id: msg.id ?? null, status: "delivered" },
              { onConflict: "meta_message_id", ignoreDuplicates: true },
            )
            .select("id")
            .maybeSingle();
          if (!insertedForm && msg.id) { continue; } // a genuine retry of an already-processed delivery — skip entirely

          const flowToken = typeof parsed.flow_token === "string" ? parsed.flow_token : null;
          if (flowToken) {
            await admin.from("wa_flow_sends").update({ response: parsed, completed_at: new Date().toISOString() }).eq("flow_token", flowToken);
          }
          await admin.from("contacts").update({ session_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }).eq("id", contactId);
          continue;
        }

        // A button/list tap has no `text.body` of its own — the button or
        // row's title stands in for it everywhere downstream (storage,
        // automations, chatbot-flow branch matching) so those don't need to
        // know interactive replies exist as a separate case.
        const interactiveReplyTitle = msg.interactive?.button_reply?.title ?? msg.interactive?.list_reply?.title;
        // Real textual content, from either a text message or a button/list
        // tap — what opt-out/opt-in and chatbot-flow branch matching key off.
        // Excludes the bracketed placeholder below on purpose: an image with
        // no caption shouldn't be able to advance a flow or trigger "STOP".
        const matchableBody = msg.text?.body ?? interactiveReplyTitle;
        const inboundBody = matchableBody ?? `[${msg.type ?? "unsupported"} message]`;

        // A genuine retry of this exact wamid (Meta's delivery is "at least
        // once", not "exactly once") must not duplicate the message in the
        // inbox or re-run everything below it — a second automation/flow
        // reply, a second AI classification, a second outbound webhook.
        const { data: insertedMessage } = await admin
          .from("messages")
          .upsert(
            { workspace_id: workspaceId, contact_id: contactId, direction: "inbound", body: inboundBody, meta_message_id: msg.id ?? null, status: "delivered" },
            { onConflict: "meta_message_id", ignoreDuplicates: true },
          )
          .select("id")
          .maybeSingle();
        if (!insertedMessage && msg.id) continue;

        // Every inbound message resets the 24h customer-service window —
        // this is what the reply UI and send-time guard both check against.
        await admin
          .from("contacts")
          .update({ session_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
          .eq("id", contactId);

        const wsId = workspaceId;
        if (isNewContact) {
          after(() => dispatchOutboundWebhooks(wsId, "contact.created", { contactId, phone: msg.from }));
          after(async () => {
            const { data: ws } = await admin.from("workspaces").select("klaviyo_api_key").eq("id", wsId).single();
            if (ws?.klaviyo_api_key) await syncKlaviyoProfile(ws.klaviyo_api_key, msg.from!, profileNameForNewContact);
          });
          after(async () => {
            const { data: ws } = await admin.from("workspaces").select("auto_assignment_enabled").eq("id", wsId).single();
            if (!ws?.auto_assignment_enabled) return;
            const assigneeId = await pickAssignee(admin, wsId);
            if (assigneeId) await admin.from("contacts").update({ assignee_id: assigneeId }).eq("id", contactId);
          });
        }
        after(() => dispatchOutboundWebhooks(wsId, "message.received", { contactId, phone: msg.from, body: inboundBody }));

        // Auto-tag + sentiment on every real inbound text — contacts self-segment
        // by intent without anyone tagging them by hand. Best-effort: a
        // misconfigured/unavailable AI key just means no tags get added, never a
        // reason to fail webhook processing.
        if (msg.text?.body && process.env.ANTHROPIC_API_KEY) {
          const cId = contactId;
          after(async () => {
            try {
              const { tags: newTags, sentiment } = await classifyInboundMessage(msg.text!.body!);
              const { data: existingContact } = await admin.from("contacts").select("tags").eq("id", cId).single();
              const mergedTags = [...new Set([...(existingContact?.tags ?? []), ...newTags])];
              await admin.from("contacts").update({ tags: mergedTags, last_sentiment: sentiment }).eq("id", cId);
            } catch {
              // Classification is a nice-to-have, never load-bearing.
            }
          });
        }

        // ── Opt-out / opt-in — a documented, code-enforced unsubscribe path ────
        let handledAsComplianceKeyword = false;
        if (matchableBody && isOptOutMessage(matchableBody)) {
          await admin.from("contacts").update({ opted_out: true }).eq("id", contactId);
          await sendAndLog(admin, workspaceId, contactId, msg.from, OPT_OUT_CONFIRMATION, matchedNumberId);
          handledAsComplianceKeyword = true;
        } else if (matchableBody && isOptInMessage(matchableBody)) {
          await admin.from("contacts").update({ opted_out: false }).eq("id", contactId);
          handledAsComplianceKeyword = true;
        }

        // Tracks whether anything (opt-out/in confirmation, a flow step, or a
        // keyword automation) already replied to this inbound message — the
        // business-hours away-message further below only fires when nothing
        // else did.
        let respondedToInbound = handledAsComplianceKeyword;

        // ── Chatbot flows — multi-step, branching; checked before the
        // single-keyword automations fallback below ────────────────────────
        if (!handledAsComplianceKeyword && matchableBody) {
          const normalized = matchableBody.trim().toLowerCase();
          const { data: flowState } = await admin
            .from("contact_flow_state")
            .select("flow_id, current_step_order, variables")
            .eq("contact_id", contactId)
            .maybeSingle();

          let stepToSend: FlowStepRow | null = null;
          let flowIdForState: string | null = null;
          let inActiveFlow = false;
          // Carries forward across the whole conversation (not just this hop) —
          // seeded from whatever's already stored, extended below if the step
          // being answered right now captures its reply.
          let variables: Record<string, string> = (flowState?.variables as Record<string, string>) ?? {};

          if (flowState) {
            inActiveFlow = true;
            const { data: currentStep } = await admin
              .from("flow_steps")
              .select("branches, default_next_step_order, capture_variable")
              .eq("flow_id", flowState.flow_id)
              .eq("step_order", flowState.current_step_order)
              .maybeSingle();

            if (currentStep?.capture_variable) {
              variables = { ...variables, [currentStep.capture_variable]: matchableBody.trim() };
            }

            const branches = (currentStep?.branches as FlowBranch[]) ?? [];
            const matchedBranch = matchFlowBranch(branches, normalized, variables);
            const nextOrder = matchedBranch?.nextStepOrder ?? currentStep?.default_next_step_order ?? null;

            if (nextOrder != null) {
              const { data: nextStep } = await admin
                .from("flow_steps")
                .select("step_order, message_body, branches, default_next_step_order, message_type, interactive_payload, capture_variable")
                .eq("flow_id", flowState.flow_id)
                .eq("step_order", nextOrder)
                .maybeSingle();
              if (nextStep) {
                stepToSend = nextStep as FlowStepRow;
                flowIdForState = flowState.flow_id;
              }
            }
            if (!stepToSend) {
              // No matching branch and no default — the flow ends here, silently.
              await admin.from("contact_flow_state").delete().eq("contact_id", contactId);
            }
          } else {
            const { data: flows } = await admin
              .from("flows")
              .select("id, trigger_keyword, match_type")
              .eq("workspace_id", workspaceId)
              .eq("is_active", true);
            const matchedFlow = (flows ?? []).find((f) =>
              f.match_type === "exact" ? normalized === f.trigger_keyword : normalized.includes(f.trigger_keyword),
            );
            if (matchedFlow) {
              const { data: firstStep } = await admin
                .from("flow_steps")
                .select("step_order, message_body, branches, default_next_step_order, message_type, interactive_payload, capture_variable")
                .eq("flow_id", matchedFlow.id)
                .eq("step_order", 1)
                .maybeSingle();
              if (firstStep) {
                stepToSend = firstStep as FlowStepRow;
                flowIdForState = matchedFlow.id;
              }
            }
          }

          if (stepToSend && flowIdForState) {
            const sent = stepToSend.message_type === "text"
              ? await sendAndLog(admin, workspaceId, contactId, msg.from, stepToSend.message_body, matchedNumberId)
              : await sendFlowStepAndLog(admin, workspaceId, contactId, msg.from, stepToSend, matchedNumberId);
            if (sent) {
              respondedToInbound = true;
              const stepContinues = stepToSend.branches.length > 0 || stepToSend.default_next_step_order != null;
              if (stepContinues) {
                await admin.from("contact_flow_state").upsert({
                  contact_id: contactId,
                  flow_id: flowIdForState,
                  current_step_order: stepToSend.step_order,
                  variables,
                  updated_at: new Date().toISOString(),
                });
              } else {
                await admin.from("contact_flow_state").delete().eq("contact_id", contactId);
              }
            }
          }

          // Only fall back to a single-keyword automation when the contact
          // wasn't already mid-conversation with a flow — an unrelated global
          // auto-reply injected into a live flow would be confusing.
          if (!stepToSend && !inActiveFlow) {
            const { data: automations } = await admin
              .from("automations")
              .select("trigger_keyword, match_type, reply_body")
              .eq("workspace_id", workspaceId)
              .eq("is_active", true);

            const matched = (automations ?? []).find((a) =>
              a.match_type === "exact" ? normalized === a.trigger_keyword : normalized.includes(a.trigger_keyword),
            );
            if (matched) {
              const sent = await sendAndLog(admin, workspaceId, contactId, msg.from, matched.reply_body, matchedNumberId);
              if (sent) respondedToInbound = true;
            }

            // ── Keyword-triggered sequences — a multi-step drip instead of a
            // single fixed reply. If the first step has no delay, send it
            // immediately (matching what a "keyword trigger" naturally
            // implies); any later step still goes through the sequences
            // cron, same as an abandoned-cart enrollment. ──────────────────
            if (!matched) {
              const { data: seqs } = await admin
                .from("sequences")
                .select("id, trigger_keyword, match_type")
                .eq("workspace_id", workspaceId)
                .eq("trigger_type", "keyword")
                .eq("is_active", true);
              const matchedSeq = (seqs ?? []).find((s) =>
                s.match_type === "exact" ? normalized === s.trigger_keyword : normalized.includes(s.trigger_keyword ?? ""),
              );
              if (matchedSeq) {
                const { data: firstStep } = await admin
                  .from("sequence_steps")
                  .select("step_order, delay_minutes, message_body")
                  .eq("sequence_id", matchedSeq.id)
                  .order("step_order", { ascending: true })
                  .limit(1)
                  .maybeSingle();

                if (firstStep && firstStep.delay_minutes === 0) {
                  const sent = await sendAndLog(admin, workspaceId, contactId, msg.from, firstStep.message_body, matchedNumberId);
                  if (sent) {
                    respondedToInbound = true;
                    const { data: secondStep } = await admin
                      .from("sequence_steps")
                      .select("delay_minutes")
                      .eq("sequence_id", matchedSeq.id)
                      .eq("step_order", firstStep.step_order + 1)
                      .maybeSingle();
                    await admin.from("sequence_enrollments").upsert({
                      sequence_id: matchedSeq.id,
                      contact_id: contactId,
                      workspace_id: workspaceId,
                      current_step_order: firstStep.step_order,
                      status: secondStep ? "active" : "completed",
                      next_send_at: secondStep ? new Date(Date.now() + secondStep.delay_minutes * 60_000).toISOString() : new Date().toISOString(),
                    }, { onConflict: "sequence_id,contact_id" });
                  }
                } else if (firstStep) {
                  await enrollContactInSequence(admin, { sequenceId: matchedSeq.id, contactId, workspaceId });
                  respondedToInbound = true; // an enrollment IS the response here, even though the message goes out later via cron
                }
              }
            }
          }
        }

        // ── Business-hours away-message — only for the start of a fresh
        // conversation (no active session before this message) that nothing
        // above already answered, and only while actually outside the
        // workspace's configured hours right now. ─────────────────────────
        if (!respondedToInbound && !hadActiveSessionBeforeThisMessage) {
          const { data: wsHours } = await admin
            .from("workspaces")
            .select("business_hours_enabled, business_hours_timezone, away_message")
            .eq("id", workspaceId)
            .single();
          if (wsHours?.business_hours_enabled) {
            const { data: hoursRows } = await admin
              .from("business_hours")
              .select("day_of_week, opens_at, closes_at")
              .eq("workspace_id", workspaceId);
            if (!isWithinBusinessHours(hoursRows ?? [], wsHours.business_hours_timezone)) {
              await sendAndLog(admin, workspaceId, contactId, msg.from, wsHours.away_message, matchedNumberId);
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}

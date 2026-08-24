/**
 * WhatsApp Calling — Meta's Business Calling API (launched broadly June
 * 2026). Split deliberately into what's actually a REST call and what
 * isn't:
 *
 *  - Requesting call permission from a contact, and reading webhook call
 *    events (ringing/connected/ended/missed) — these ARE plain Graph API
 *    calls, same shape as everything else in whatsapp.ts, and are what
 *    this file implements for real.
 *  - Actually PLACING or ANSWERING a call with live audio needs a WebRTC
 *    SDP offer/answer exchange and a real media engine on this end — Node
 *    has no built-in WebRTC audio stack, so that half genuinely isn't a
 *    "call fetch()" job. initiateOutboundCall() below throws
 *    CallingMediaNotImplementedError on purpose rather than pretending to
 *    place a call that would never actually connect audio.
 *
 * Also gated behind workspace.calling_enabled, which itself is meaningless
 * until Meta has granted this specific WABA calling access — a manual,
 * per-business approval step on Meta's side, not something this code can
 * turn on by itself.
 */

const GRAPH_API_VERSION = "v22.0";

export class CallingNotEnabledError extends Error {
  constructor() {
    super("Calling isn't enabled for this workspace — Meta grants calling access per WABA, ask them to enable it first.");
    this.name = "CallingNotEnabledError";
  }
}

export class CallingMediaNotImplementedError extends Error {
  constructor() {
    super(
      "Placing/answering a call with live audio needs a WebRTC media integration this build doesn't have yet — " +
        "permission requests and call-log webhooks work today, actual voice media doesn't.",
    );
    this.name = "CallingMediaNotImplementedError";
  }
}

interface CallingCreds {
  whatsapp_phone_number_id: string | null;
  whatsapp_access_token: string | null;
  calling_enabled: boolean;
}

function requireCallingCreds(ws: CallingCreds): { phoneNumberId: string; token: string } {
  if (!ws.calling_enabled) throw new CallingNotEnabledError();
  if (!ws.whatsapp_phone_number_id || !ws.whatsapp_access_token) throw new CallingNotEnabledError();
  return { phoneNumberId: ws.whatsapp_phone_number_id, token: ws.whatsapp_access_token };
}

/**
 * Meta requires a business to have standing permission before it can call a
 * user — this sends the interactive "may we call you?" prompt. A real,
 * working Graph API call.
 */
export async function requestCallPermission(ws: CallingCreds, to: string): Promise<void> {
  const { phoneNumberId, token } = requireCallingCreds(ws);
  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "call_permission_request",
        action: { name: "call_permission_request" },
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json()) as { error?: { message?: string } };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Meta rejected the call permission request (HTTP ${res.status})`);
}

/** Deliberately not implemented — see the file header. Throws rather than silently no-op-ing. */
export async function initiateOutboundCall(ws: CallingCreds, _to: string): Promise<never> {
  requireCallingCreds(ws); // still checked, so the "calling not enabled" case surfaces distinctly from "not implemented"
  throw new CallingMediaNotImplementedError();
}

export interface CallEvent {
  callId: string;
  from: string;
  status: "ringing" | "connected" | "ended" | "missed" | "failed";
  timestamp: string;
}

/** Parses Meta's call-event webhook payload shape into something the route can log without knowing the wire format. */
export function parseCallWebhookEvent(value: {
  calls?: Array<{ id?: string; from?: string; status?: string; timestamp?: string }>;
}): CallEvent[] {
  return (value.calls ?? [])
    .filter((c): c is { id: string; from: string; status: string; timestamp?: string } => Boolean(c.id && c.from && c.status))
    .map((c) => ({
      callId: c.id,
      from: c.from,
      status: (["ringing", "connected", "ended", "missed", "failed"] as const).includes(c.status as CallEvent["status"])
        ? (c.status as CallEvent["status"])
        : "failed",
      timestamp: c.timestamp ?? new Date().toISOString(),
    }));
}

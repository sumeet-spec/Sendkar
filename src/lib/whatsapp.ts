/**
 * Meta WhatsApp Cloud API — direct integration, no BSP.
 *
 * Each workspace holds its own whatsapp_phone_number_id + whatsapp_access_token
 * (multi-tenant: every customer connects their own WhatsApp Business number).
 * Functions here throw WhatsAppNotConfiguredError when a workspace hasn't
 * completed onboarding yet, so the rest of the app works and is testable
 * before any real Meta credentials exist — same "off until configured"
 * posture as Continuum's lib/ses.ts.
 */

const GRAPH_API_VERSION = "v22.0";

export class WhatsAppNotConfiguredError extends Error {
  constructor() {
    super("This workspace hasn't connected a WhatsApp Business number yet.");
    this.name = "WhatsAppNotConfiguredError";
  }
}

export interface WorkspaceCreds {
  whatsapp_phone_number_id: string | null;
  whatsapp_access_token: string | null;
}

function requireCreds(ws: WorkspaceCreds): { phoneNumberId: string; token: string } {
  if (!ws.whatsapp_phone_number_id || !ws.whatsapp_access_token) {
    throw new WhatsAppNotConfiguredError();
  }
  return { phoneNumberId: ws.whatsapp_phone_number_id, token: ws.whatsapp_access_token };
}

async function graphPost(phoneNumberId: string, token: string, body: unknown) {
  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    },
  );
  const json = (await res.json()) as {
    messages?: [{ id: string }];
    error?: { message?: string; code?: number };
  };
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `WhatsApp API error (HTTP ${res.status})`);
  }
  const messageId = json.messages?.[0]?.id;
  if (!messageId) throw new Error("WhatsApp API accepted the request but returned no message id.");
  return { metaMessageId: messageId };
}

export interface SendTemplateInput {
  workspace: WorkspaceCreds;
  to: string; // digits only, country code included, e.g. 919408305599
  templateName: string;
  language: string; // Meta locale code, e.g. 'hi', 'en_US'
  bodyParams?: string[]; // positional {{1}}, {{2}}... values, if the template has any
}

export async function sendTemplateMessage(input: SendTemplateInput) {
  const { phoneNumberId, token } = requireCreds(input.workspace);
  return graphPost(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to: input.to,
    type: "template",
    template: {
      name: input.templateName,
      language: { code: input.language },
      ...(input.bodyParams?.length
        ? { components: [{ type: "body", parameters: input.bodyParams.map((text) => ({ type: "text", text })) }] }
        : {}),
    },
  });
}

export interface SendSessionInput {
  workspace: WorkspaceCreds;
  to: string;
  body: string;
}

/** Free-text reply — only deliverable inside the 24h window after an inbound message. */
export async function sendSessionMessage(input: SendSessionInput) {
  const { phoneNumberId, token } = requireCreds(input.workspace);
  return graphPost(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to: input.to,
    type: "text",
    text: { body: input.body },
  });
}

export function isWhatsAppConfigured(ws: WorkspaceCreds): boolean {
  return Boolean(ws.whatsapp_phone_number_id && ws.whatsapp_access_token);
}

// ── Webhook signature verification ────────────────────────────────────────────
// Meta signs the raw webhook body with the app secret via HMAC-SHA256, sent
// as `X-Hub-Signature-256: sha256=<hex>`. This is a single shared app secret
// across all workspaces' WhatsApp connections (they all go through the same
// Meta App), unlike the per-workspace access tokens above.

export async function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expected = signatureHeader.startsWith("sha256=") ? signatureHeader.slice(7) : signatureHeader;

  const crypto = await import("node:crypto");
  const computed = crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(computed);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ── Messaging tier ladder ──────────────────────────────────────────────────────
// Meta's own scaling: a fresh/low-quality number is capped at 250 unique
// recipients/24h, rising to 1,000 / 10,000 / 100,000 as quality stays high.
// This is enforced by Meta regardless of what we do — tracked here only so
// the UI can show accurate remaining-quota and the sender can stop cleanly
// instead of discovering the cap via a stream of failed sends.
export const MESSAGING_TIERS = [250, 1_000, 10_000, 100_000] as const;

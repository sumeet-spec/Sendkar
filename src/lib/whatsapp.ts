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

// Only network failures and Meta's own 5xx/rate-limit responses are worth
// retrying — a 4xx (bad template params, invalid recipient, permanently
// disallowed re-engagement) will fail identically every time, so retrying
// it would just waste the cron run's time budget on every recipient behind it.
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const GRAPH_RETRY_DELAYS_MS = [0, 600]; // one quick retry, not the full outbound-webhook backoff ladder

async function graphPost(phoneNumberId: string, token: string, body: unknown) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < GRAPH_RETRY_DELAYS_MS.length; attempt++) {
    if (GRAPH_RETRY_DELAYS_MS[attempt] > 0) await new Promise((r) => setTimeout(r, GRAPH_RETRY_DELAYS_MS[attempt]));

    let res: Response;
    try {
      res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Network request failed");
      continue; // network failure — worth a retry
    }

    const json = (await res.json()) as { messages?: [{ id: string }]; error?: { message?: string; code?: number } };

    if (res.ok && !json.error) {
      const messageId = json.messages?.[0]?.id;
      if (!messageId) throw new Error("WhatsApp API accepted the request but returned no message id.");
      return { metaMessageId: messageId };
    }

    lastError = new Error(json.error?.message ?? `WhatsApp API error (HTTP ${res.status})`);
    if (!RETRYABLE_STATUS.has(res.status)) throw lastError; // permanent failure — don't waste a retry on it
  }

  throw lastError ?? new Error("WhatsApp API request failed after retries.");
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

// ── Product catalog messages ────────────────────────────────────────────────
// References a catalog already set up in Meta Commerce Manager — same
// "configured once elsewhere, sent from here" posture as templates. Only
// deliverable within the 24h session window, same as any free-form message.

export interface SendProductInput {
  workspace: WorkspaceCreds;
  to: string;
  catalogId: string;
  productRetailerId: string;
  bodyText?: string;
}

/** A single product card the recipient can view and add to cart in-chat. */
export async function sendProductMessage(input: SendProductInput) {
  const { phoneNumberId, token } = requireCreds(input.workspace);
  return graphPost(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to: input.to,
    type: "interactive",
    interactive: {
      type: "product",
      ...(input.bodyText ? { body: { text: input.bodyText } } : {}),
      action: { catalog_id: input.catalogId, product_retailer_id: input.productRetailerId },
    },
  });
}

export interface SendCatalogInput {
  workspace: WorkspaceCreds;
  to: string;
  bodyText: string;
  thumbnailProductRetailerId?: string;
}

/** A "browse our catalog" message linking the whole connected catalog, not one product. */
export async function sendCatalogMessage(input: SendCatalogInput) {
  const { phoneNumberId, token } = requireCreds(input.workspace);
  return graphPost(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to: input.to,
    type: "interactive",
    interactive: {
      type: "catalog_message",
      body: { text: input.bodyText },
      action: {
        name: "catalog_message",
        ...(input.thumbnailProductRetailerId ? { parameters: { thumbnail_product_retailer_id: input.thumbnailProductRetailerId } } : {}),
      },
    },
  });
}

// ── Real template submission ──────────────────────────────────────────────
// Actually calls Meta's template API instead of just recording a name you
// typed in — this is the difference between a tracker and an integration.
// Submission is scoped to the WhatsApp Business Account (WABA), not the
// phone number, so it needs its own credential.

export interface TemplateComponents {
  headerType?: "none" | "text" | "image";
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttons?: Array<{ type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER"; text: string; url?: string; phone_number?: string }>;
}

export interface SubmitTemplateInput {
  wabaId: string;
  token: string;
  name: string; // lowercase, underscores only — Meta's naming rule
  language: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  components: TemplateComponents;
}

export async function submitTemplateToMeta(input: SubmitTemplateInput) {
  const components: Array<Record<string, unknown>> = [];

  if (input.components.headerType === "text" && input.components.headerText) {
    components.push({ type: "HEADER", format: "TEXT", text: input.components.headerText });
  } else if (input.components.headerType === "image") {
    components.push({ type: "HEADER", format: "IMAGE" });
  }

  components.push({ type: "BODY", text: input.components.bodyText });

  if (input.components.footerText) {
    components.push({ type: "FOOTER", text: input.components.footerText });
  }
  if (input.components.buttons?.length) {
    components.push({ type: "BUTTONS", buttons: input.components.buttons });
  }

  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${input.wabaId}/message_templates`, {
    method: "POST",
    headers: { Authorization: `Bearer ${input.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      language: input.language,
      category: input.category,
      components,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const json = (await res.json()) as { id?: string; status?: string; category?: string; error?: { message?: string } };
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Meta rejected the template submission (HTTP ${res.status})`);
  }
  return json; // { id, status: "PENDING" | ..., category }
}

// ── Opt-out ────────────────────────────────────────────────────────────────
// A documented, code-enforced unsubscribe path — required for compliant
// marketing use of the API, not optional polish.
const OPT_OUT_KEYWORDS = new Set(["stop", "unsubscribe", "cancel", "optout", "opt out"]);

export function isOptOutMessage(body: string): boolean {
  return OPT_OUT_KEYWORDS.has(body.trim().toLowerCase());
}

export const OPT_OUT_CONFIRMATION =
  "You won't receive any more marketing messages from us. Reply START to opt back in at any time.";

const OPT_IN_KEYWORDS = new Set(["start", "unstop", "subscribe", "optin", "opt in"]);

export function isOptInMessage(body: string): boolean {
  return OPT_IN_KEYWORDS.has(body.trim().toLowerCase());
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

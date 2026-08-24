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

// ── WABA webhook subscription ───────────────────────────────────────────────
// Entering a correct phone_number_id + access_token is enough to SEND
// messages, but Meta only delivers inbound messages and delivery-status
// webhooks to Sendkar's callback URL for a WABA that has explicitly
// subscribed Sendkar's app — a separate API call nothing in this codebase
// was making. Without it, a workspace could send campaigns successfully
// and never see a single reply or a single delivered/read status update,
// with nothing in the UI explaining why.

export async function subscribeAppToWaba(wabaId: string, token: string): Promise<void> {
  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${wabaId}/subscribed_apps`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
  if (!res.ok || json.error || !json.success) {
    throw new Error(json.error?.message ?? `Meta rejected the webhook subscription (HTTP ${res.status})`);
  }
}

// ── Connection verification ──────────────────────────────────────────────────
// A read-only call against the phone number itself — the cheapest way to
// confirm a phone_number_id + access_token pair is actually valid before
// the workspace finds out the hard way when a real campaign fails.

export interface PhoneNumberInfo {
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  qualityRating: string | null;
}

export async function verifyPhoneNumberCreds(phoneNumberId: string, token: string): Promise<PhoneNumberInfo> {
  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`,
    { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15_000) },
  );
  const json = (await res.json()) as {
    display_phone_number?: string; verified_name?: string; quality_rating?: string; error?: { message?: string };
  };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Meta rejected these credentials (HTTP ${res.status})`);
  return { displayPhoneNumber: json.display_phone_number ?? null, verifiedName: json.verified_name ?? null, qualityRating: json.quality_rating ?? null };
}

// ── Read receipts + typing indicator ────────────────────────────────────────
// One call does both: marks the customer's message read (blue ticks) and
// shows "typing…" in their WhatsApp for up to 25s or until the next message
// arrives, whichever is first. Meta requires the two be combined in one
// request — there's no separate "just show typing" call.

export async function markReadWithTypingIndicator(workspace: WorkspaceCreds, messageId: string) {
  const { phoneNumberId, token } = requireCreds(workspace);
  return graphPost(phoneNumberId, token, {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
    typing_indicator: { type: "text" },
  });
}

// ── Reactions ────────────────────────────────────────────────────────────────
// Either side of a conversation can carry exactly one reaction at a time;
// sending a new one replaces the last, and an empty string removes it.

export interface SendReactionInput {
  workspace: WorkspaceCreds;
  to: string;
  messageId: string; // the message being reacted to, by its wamid
  emoji: string; // "" removes the reaction
}

export async function sendReaction(input: SendReactionInput) {
  const { phoneNumberId, token } = requireCreds(input.workspace);
  return graphPost(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to: input.to,
    type: "reaction",
    reaction: { message_id: input.messageId, emoji: input.emoji },
  });
}

// ── Interactive messages: reply buttons and lists ───────────────────────────
// Both only deliverable inside the 24h session window, same as any
// free-form message — Meta treats these as session content, not templates.

export interface InteractiveButton {
  id: string;
  title: string; // Meta's limit: 20 characters
}

export interface SendButtonsInput {
  workspace: WorkspaceCreds;
  to: string;
  bodyText: string;
  buttons: InteractiveButton[]; // max 3
}

export async function sendButtonsMessage(input: SendButtonsInput) {
  const { phoneNumberId, token } = requireCreds(input.workspace);
  return graphPost(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to: input.to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: input.bodyText },
      action: {
        buttons: input.buttons.slice(0, 3).map((b) => ({ type: "reply", reply: { id: b.id, title: b.title } })),
      },
    },
  });
}

export interface InteractiveListRow {
  id: string;
  title: string; // Meta's limit: 24 characters
  description?: string;
}
export interface InteractiveListSection {
  title: string;
  rows: InteractiveListRow[];
}

export interface SendListInput {
  workspace: WorkspaceCreds;
  to: string;
  bodyText: string;
  buttonText: string; // the label on the button that opens the list
  sections: InteractiveListSection[];
}

export async function sendListMessage(input: SendListInput) {
  const { phoneNumberId, token } = requireCreds(input.workspace);
  return graphPost(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to: input.to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: input.bodyText },
      action: { button: input.buttonText, sections: input.sections },
    },
  });
}

// ── WhatsApp Flows ───────────────────────────────────────────────────────────
// Native, multi-screen in-chat forms. This is the static-only slice of the
// Flows product: screens defined once, sent as-is, completion comes back
// on the webhook. There's deliberately no per-screen dynamic data-exchange
// endpoint here — that needs an RSA keypair registered with Meta and a
// public encrypt/decrypt endpoint, a distinct, larger piece of work.

export interface WaFlowScreenField {
  type: "text_heading" | "text_body" | "text_input" | "text_area" | "radio_buttons" | "checkbox";
  label: string; // heading/body text, or the question for an input/choice field
  name?: string; // form field key — required for input/choice types
  required?: boolean;
  options?: string[]; // for radio_buttons / checkbox
}

export interface WaFlowScreen {
  id: string; // Meta's screen id, e.g. "SCREEN_1" — must be unique per flow
  title: string;
  fields: WaFlowScreenField[];
  terminal?: boolean; // true = this screen's footer completes the flow instead of navigating on
}

/** Compiles Sendkar's own screen/field schema into Meta's Flow JSON format. */
export function compileFlowJson(screens: WaFlowScreen[]) {
  return {
    version: "7.1",
    screens: screens.map((screen, i) => {
      const children: Array<Record<string, unknown>> = [];
      const formChildren: Array<Record<string, unknown>> = [];

      for (const field of screen.fields) {
        if (field.type === "text_heading" || field.type === "text_body") {
          children.push({ type: field.type === "text_heading" ? "TextHeading" : "TextBody", text: field.label });
          continue;
        }
        const base = { name: field.name, label: field.label, required: field.required ?? false };
        if (field.type === "text_input") formChildren.push({ type: "TextInput", "input-type": "text", ...base });
        else if (field.type === "text_area") formChildren.push({ type: "TextArea", ...base });
        else if (field.type === "radio_buttons") formChildren.push({ type: "RadioButtonsGroup", "data-source": (field.options ?? []).map((o) => ({ id: o, title: o })), ...base });
        else if (field.type === "checkbox") formChildren.push({ type: "CheckboxGroup", "data-source": (field.options ?? []).map((o) => ({ id: o, title: o })), ...base });
      }

      const isLastScreen = i === screens.length - 1;
      formChildren.push({
        type: "Footer",
        label: screen.terminal || isLastScreen ? "Submit" : "Continue",
        "on-click-action": screen.terminal || isLastScreen
          ? { name: "complete", payload: {} }
          : { name: "navigate", next: { type: "screen", name: screens[i + 1]?.id }, payload: {} },
      });

      children.push({ type: "Form", name: `form_${screen.id}`, children: formChildren });

      return {
        id: screen.id,
        title: screen.title,
        terminal: screen.terminal || isLastScreen,
        layout: { type: "SingleColumnLayout", children },
      };
    }),
  };
}

export async function createMetaFlow(wabaId: string, token: string, name: string, categories: string[]) {
  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${wabaId}/flows`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, categories }),
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!res.ok || json.error || !json.id) throw new Error(json.error?.message ?? `Meta rejected the flow creation (HTTP ${res.status})`);
  return json.id;
}

export async function uploadFlowJson(flowId: string, token: string, flowJson: object) {
  const form = new FormData();
  form.append("asset_type", "FLOW_JSON");
  form.append("name", "flow.json");
  form.append("file", new Blob([JSON.stringify(flowJson)], { type: "application/json" }), "flow.json");

  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${flowId}/assets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json()) as { success?: boolean; validation_errors?: unknown[]; error?: { message?: string } };
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `Meta rejected the flow JSON (HTTP ${res.status})`);
  if (json.validation_errors?.length) throw new Error(`Flow JSON validation failed: ${JSON.stringify(json.validation_errors)}`);
  return json;
}

export async function publishMetaFlow(flowId: string, token: string) {
  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${flowId}/publish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
  if (!res.ok || json.error || !json.success) throw new Error(json.error?.message ?? `Meta rejected publishing the flow (HTTP ${res.status})`);
  return json;
}

export interface SendFlowInput {
  workspace: WorkspaceCreds;
  to: string;
  bodyText: string;
  buttonText: string;
  flowId: string;
  flowToken: string;
  firstScreenId: string;
}

export async function sendFlowMessage(input: SendFlowInput) {
  const { phoneNumberId, token } = requireCreds(input.workspace);
  return graphPost(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to: input.to,
    type: "interactive",
    interactive: {
      type: "flow",
      body: { text: input.bodyText },
      action: {
        name: "flow",
        parameters: {
          flow_message_version: "3",
          flow_id: input.flowId,
          flow_token: input.flowToken,
          flow_cta: input.buttonText,
          flow_action: "navigate",
          flow_action_payload: { screen: input.firstScreenId },
        },
      },
    },
  });
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

export interface CarouselCard {
  headerHandle: string; // a Meta media handle from the Resumable Upload API — not a plain URL
  bodyText: string;
  buttons?: Array<{ type: "QUICK_REPLY" | "URL"; text: string; url?: string }>;
}

export interface TemplateComponents {
  headerType?: "none" | "text" | "image";
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttons?: Array<{ type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER"; text: string; url?: string; phone_number?: string }>;
  carouselCards?: CarouselCard[]; // 2-10 cards — when present, this becomes a carousel template
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

  // A carousel replaces the body/header above with per-card versions of the
  // same idea — Meta's top-level BODY is still required as the intro text
  // shown above the scrollable cards.
  if (input.components.carouselCards?.length) {
    if (input.components.carouselCards.length < 2 || input.components.carouselCards.length > 10) {
      throw new Error("A carousel template needs between 2 and 10 cards.");
    }
    components.push({
      type: "CAROUSEL",
      cards: input.components.carouselCards.map((card, i) => ({
        card_index: i,
        components: [
          { type: "HEADER", format: "IMAGE", example: { header_handle: [card.headerHandle] } },
          { type: "BODY", text: card.bodyText },
          ...(card.buttons?.length ? [{ type: "BUTTONS", buttons: card.buttons }] : []),
        ],
      })),
    });
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

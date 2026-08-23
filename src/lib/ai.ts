/**
 * AI-drafted reply suggestions for the inbox — a real, scoped feature
 * (draft one reply from the visible thread) rather than a vague "AI agent"
 * promise. Gated on ANTHROPIC_API_KEY, same off-until-configured pattern
 * as everything else.
 */

export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI reply drafting isn't configured — set ANTHROPIC_API_KEY.");
    this.name = "AiNotConfiguredError";
  }
}

export interface ThreadMessage {
  direction: "inbound" | "outbound";
  body: string | null;
}

export async function draftReply(thread: ThreadMessage[], contactName: string | null): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AiNotConfiguredError();

  const transcript = thread
    .slice(-10) // recent context is enough; the whole history isn't needed for a one-line draft
    .map((m) => `${m.direction === "inbound" ? "Customer" : "You"}: ${m.body ?? "[template message]"}`)
    .join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You're drafting a WhatsApp reply on behalf of a business, to a customer${contactName ? ` named ${contactName}` : ""}. Here's the conversation so far:\n\n${transcript}\n\nDraft ONE short, natural reply as the business. Output only the reply text, nothing else — no quotes, no preamble.`,
        },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const data = (await res.json()) as { content?: Array<{ text?: string }>; error?: { message?: string } };
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `AI request failed (HTTP ${res.status})`);

  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error("AI returned an empty draft.");
  return text;
}

/** Shared Claude call — every other AI feature here is a thin prompt on top of this. */
async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AiNotConfiguredError();

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const data = (await res.json()) as { content?: Array<{ text?: string }>; error?: { message?: string } };
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `AI request failed (HTTP ${res.status})`);
  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error("AI returned an empty response.");
  return text;
}

/**
 * Drafts a full WhatsApp template (header/body/footer/buttons) from a plain
 * description — something neither WATI nor Interakt offer; their template
 * builder is manual entry only. Output is asked for as strict JSON since
 * the caller needs structured fields, not prose.
 */
export interface GeneratedTemplateDraft {
  headerType: "none" | "text";
  headerText?: string;
  bodyText: string;
  footerText?: string;
  quickReplies: string[];
}

export async function generateTemplateDraft(description: string, language: string): Promise<GeneratedTemplateDraft> {
  const prompt = `Draft a WhatsApp Business template message for this goal: "${description}"

Language/locale: ${language}

Rules: WhatsApp templates support a header (none or short text, no variables), a body (use {{1}}, {{2}}... for variables, {{1}} conventionally the recipient's name), an optional footer (short, no variables), and up to 3 quick-reply buttons.

Respond with ONLY strict JSON, no markdown fences, no prose, in this exact shape:
{"headerType": "none" | "text", "headerText": "string or omit if none", "bodyText": "string", "footerText": "string or omit", "quickReplies": ["string", ...] (0-3 items, omit or empty if none)}`;

  const raw = await callClaude(prompt, 500);
  let parsed: GeneratedTemplateDraft;
  try {
    parsed = JSON.parse(raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim());
  } catch {
    throw new Error("AI returned a draft that wasn't valid JSON — try rephrasing the description.");
  }
  if (!parsed.bodyText) throw new Error("AI draft was missing body text.");
  return { headerType: parsed.headerType === "text" ? "text" : "none", headerText: parsed.headerText, bodyText: parsed.bodyText, footerText: parsed.footerText, quickReplies: Array.isArray(parsed.quickReplies) ? parsed.quickReplies.slice(0, 3) : [] };
}

/**
 * Classifies one inbound message into tags + sentiment — runs automatically
 * on every inbound WhatsApp message (see the webhook route) so contacts
 * self-segment by intent/urgency without anyone tagging them by hand.
 */
export interface MessageClassification {
  tags: string[];
  sentiment: "positive" | "neutral" | "negative" | "urgent";
}

export async function classifyInboundMessage(body: string): Promise<MessageClassification> {
  const prompt = `Classify this inbound WhatsApp message from a customer:

"${body}"

Respond with ONLY strict JSON, no markdown fences, no prose:
{"tags": ["1-3 short lowercase-with-hyphens tags, e.g. price-question, complaint, order-status, interested, spam"], "sentiment": "positive" | "neutral" | "negative" | "urgent"}`;

  const raw = await callClaude(prompt, 200);
  let parsed: MessageClassification;
  try {
    parsed = JSON.parse(raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim());
  } catch {
    throw new Error("Classification response wasn't valid JSON.");
  }
  const validSentiments = new Set(["positive", "neutral", "negative", "urgent"]);
  return {
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3).map((t) => String(t).toLowerCase()) : [],
    sentiment: validSentiments.has(parsed.sentiment) ? parsed.sentiment : "neutral",
  };
}

/** A quick "catch me up" summary of a thread — for an agent picking up a conversation cold, or a handoff between team members. */
export async function summarizeThread(thread: ThreadMessage[], contactName: string | null): Promise<string> {
  const transcript = thread
    .slice(-40)
    .map((m) => `${m.direction === "inbound" ? "Customer" : "Business"}: ${m.body ?? "[template message]"}`)
    .join("\n");

  const prompt = `Summarize this WhatsApp conversation${contactName ? ` with ${contactName}` : ""} in 2-3 short sentences for a teammate who has never seen it — what they want, what's been done, what's outstanding. No preamble, just the summary.\n\n${transcript}`;
  return callClaude(prompt, 250);
}

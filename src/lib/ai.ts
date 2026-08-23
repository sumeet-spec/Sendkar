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

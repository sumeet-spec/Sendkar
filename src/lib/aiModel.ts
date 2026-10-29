/**
 * Which Claude model Sendkar's AI features call.
 *
 * Haiku 5.5 costs a tenth of Haiku 4.5 ($0.10 / $0.50 per million input / output tokens, against
 * $1 / $5), which is what makes AI replies cheap enough to leave unlimited. It is tried first; if
 * the API reports it doesn't know the model (HTTP 404), the previous Haiku is used instead so a
 * wrong or not-yet-enabled id degrades to "a little dearer" rather than "AI is broken".
 */
export const AI_MODELS = ["claude-haiku-5-5", "claude-haiku-4-5-20251001"] as const;

const ENDPOINT = "https://api.anthropic.com/v1/messages";

// Once a model is found to be unknown, skip it for the rest of this instance's life instead of
// paying an extra failed round trip on every single AI call.
let firstUsable = 0;

/** For tests: start again from the preferred model. */
export function resetModelChoice() {
  firstUsable = 0;
}

export async function postMessages(apiKey: string, payload: Record<string, unknown>, timeoutMs: number): Promise<Response> {
  for (let i = firstUsable; i < AI_MODELS.length; i++) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model: AI_MODELS[i], ...payload }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const lastChoice = i === AI_MODELS.length - 1;
    // Only "this model does not exist" moves on. Rate limits, bad requests and server errors are the
    // caller's to report: another model would hit the same wall.
    if (res.status !== 404 || lastChoice) return res;
    firstUsable = i + 1;
  }
  throw new Error("No AI model is available.");
}

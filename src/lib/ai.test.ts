import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateAutoReply, AiNotConfiguredError } from "./ai";

function mockClaudeResponse(text: string) {
  return {
    ok: true,
    json: async () => ({ content: [{ text }] }),
  } as Response;
}

describe("generateAutoReply", () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env.ANTHROPIC_API_KEY = originalKey;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("throws AiNotConfiguredError with no API key, before ever calling fetch", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;
    await expect(generateAutoReply([], null, "some knowledge")).rejects.toThrow(AiNotConfiguredError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("parses a normal reply out of the API's JSON response", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockClaudeResponse(JSON.stringify({ reply: "We ship all over India, 3-5 days.", shouldHandOff: false })),
    ) as unknown as typeof fetch;

    const result = await generateAutoReply(
      [{ direction: "inbound", body: "Do you ship to Kerala?" }],
      "Anita",
      "We ship all over India, 3-5 days.",
    );
    expect(result).toEqual({ reply: "We ship all over India, 3-5 days.", shouldHandOff: false });
  });

  it("strips markdown code fences some models wrap JSON in", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockClaudeResponse('```json\n{"reply": "A team member will follow up.", "shouldHandOff": true}\n```'),
    ) as unknown as typeof fetch;

    const result = await generateAutoReply([], null, "");
    expect(result.shouldHandOff).toBe(true);
    expect(result.reply).toBe("A team member will follow up.");
  });

  it("throws a clear error instead of silently sending nothing when the model returns invalid JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue(mockClaudeResponse("not json at all")) as unknown as typeof fetch;
    await expect(generateAutoReply([], null, "")).rejects.toThrow(/valid JSON/);
  });

  it("throws when the API call itself fails, rather than sending an empty message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: "Overloaded" } }),
    } as Response) as unknown as typeof fetch;
    await expect(generateAutoReply([], null, "")).rejects.toThrow("Overloaded");
  });
});

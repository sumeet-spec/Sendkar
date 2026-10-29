import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { postMessages, resetModelChoice, AI_MODELS } from "./aiModel";

function respond(status: number) {
  return new Response(JSON.stringify({ content: [{ text: "ok" }] }), { status });
}

describe("postMessages", () => {
  let calls: Array<Record<string, unknown>>;

  beforeEach(() => {
    resetModelChoice();
    calls = [];
  });
  afterEach(() => vi.unstubAllGlobals());

  function stubFetch(statuses: number[]) {
    let i = 0;
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: { body: string }) => {
      calls.push(JSON.parse(init.body));
      return respond(statuses[Math.min(i++, statuses.length - 1)]);
    }));
  }

  it("uses the newest model first and sends the caller's payload with it", async () => {
    stubFetch([200]);
    const res = await postMessages("key", { max_tokens: 300, messages: [{ role: "user", content: "hi" }] }, 5000);
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ model: AI_MODELS[0], max_tokens: 300 });
  });

  it("falls back to the previous model when the new one is not found", async () => {
    stubFetch([404, 200]);
    const res = await postMessages("key", { max_tokens: 10 }, 5000);
    expect(res.status).toBe(200);
    expect(calls.map((c) => c.model)).toEqual([AI_MODELS[0], AI_MODELS[1]]);
  });

  it("remembers that the new model is unavailable instead of retrying it on every call", async () => {
    stubFetch([404, 200, 200]);
    await postMessages("key", { max_tokens: 10 }, 5000);
    await postMessages("key", { max_tokens: 10 }, 5000);
    expect(calls.map((c) => c.model)).toEqual([AI_MODELS[0], AI_MODELS[1], AI_MODELS[1]]);
  });

  it("does not switch models for rate limits or server errors, which another model would hit too", async () => {
    stubFetch([429]);
    expect((await postMessages("key", { max_tokens: 10 }, 5000)).status).toBe(429);
    expect(calls).toHaveLength(1);
    resetModelChoice();
    stubFetch([500]);
    expect((await postMessages("key", { max_tokens: 10 }, 5000)).status).toBe(500);
  });

  it("returns the last model's 404 rather than looping forever", async () => {
    stubFetch([404, 404]);
    expect((await postMessages("key", { max_tokens: 10 }, 5000)).status).toBe(404);
    expect(calls).toHaveLength(2);
  });
});

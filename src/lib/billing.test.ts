import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createDodoCheckout } from "./billing";

const ENV_KEYS = ["DODO_PAYMENTS_API_KEY", "DODO_PRODUCT_STARTER", "DODO_PRODUCT_GROWTH", "DODO_PRODUCT_SCALE"] as const;
const originalEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) originalEnv[k] = process.env[k];
  process.env.DODO_PAYMENTS_API_KEY = "test-api-key";
  process.env.DODO_PRODUCT_STARTER = "prod_starter";
  process.env.DODO_PRODUCT_GROWTH = "prod_growth";
  process.env.DODO_PRODUCT_SCALE = "prod_scale";
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (originalEnv[k] !== undefined) process.env[k] = originalEnv[k]; else delete process.env[k];
  }
  vi.unstubAllGlobals();
});

describe("createDodoCheckout", () => {
  it("rejects a plan that isn't one of the paid tiers", async () => {
    const result = await createDodoCheckout({ id: "ws-1" }, "free", "https://app.sendkar.shop");
    expect(result.status).toBe(422);
    expect(result.error).toMatch(/starter, growth, scale/);
  });

  it("reports billing as unconfigured when the platform Dodo key is missing, without making a network call", async () => {
    delete process.env.DODO_PAYMENTS_API_KEY;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const result = await createDodoCheckout({ id: "ws-1" }, "growth", "https://app.sendkar.shop");
    expect(result.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports the specific plan as unconfigured when its Dodo product id is missing", async () => {
    delete process.env.DODO_PRODUCT_GROWTH;
    const result = await createDodoCheckout({ id: "ws-1" }, "growth", "https://app.sendkar.shop");
    expect(result.status).toBe(503);
    expect(result.error).toMatch(/growth/);
  });

  it("returns the checkout URL Dodo hands back on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ checkout_url: "https://checkout.dodopayments.com/abc123" }),
    }));
    const result = await createDodoCheckout({ id: "ws-1" }, "growth", "https://app.sendkar.shop");
    expect(result.status).toBe(200);
    expect(result.url).toBe("https://checkout.dodopayments.com/abc123");
  });

  it("sends the workspace id and plan in metadata so the webhook can attribute the upgrade", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ checkout_url: "https://x" }) });
    vi.stubGlobal("fetch", fetchSpy);
    await createDodoCheckout({ id: "ws-42" }, "scale", "https://app.sendkar.shop");
    const [, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.metadata).toEqual({ workspace_id: "ws-42", plan: "scale" });
    expect(body.product_cart).toEqual([{ product_id: "prod_scale", quantity: 1 }]);
  });

  it("surfaces a gateway error without leaking Dodo's raw response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    const result = await createDodoCheckout({ id: "ws-1" }, "starter", "https://app.sendkar.shop");
    expect(result.status).toBe(502);
  });

  it("treats a 200 response with no usable checkout URL as a gateway error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    const result = await createDodoCheckout({ id: "ws-1" }, "starter", "https://app.sendkar.shop");
    expect(result.status).toBe(502);
    expect(result.error).toMatch(/no checkout URL/);
  });
});

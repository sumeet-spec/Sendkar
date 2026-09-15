import crypto from "node:crypto";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  normalizeShopDomain, verifyState, verifyOAuthCallbackHmac, verifyShopifyWebhookHmac,
  extractOrderPhone, extractCheckoutPhone, isShopifyAppConfigured,
} from "./shopify";

describe("normalizeShopDomain", () => {
  it("appends .myshopify.com to a bare shop name", () => {
    expect(normalizeShopDomain("my-store")).toBe("my-store.myshopify.com");
  });

  it("strips a protocol and trailing path", () => {
    expect(normalizeShopDomain("https://my-store.myshopify.com/admin")).toBe("my-store.myshopify.com");
  });

  it("lowercases and trims", () => {
    expect(normalizeShopDomain("  My-Store.MyShopify.com  ")).toBe("my-store.myshopify.com");
  });

  it("doesn't double-append the suffix when it's already present", () => {
    expect(normalizeShopDomain("my-store.myshopify.com")).toBe("my-store.myshopify.com");
  });
});

describe("verifyState", () => {
  const secret = "app-secret";

  function sign(workspaceId: string, nonce: string, s = secret) {
    const payload = `${workspaceId}.${nonce}`;
    const sig = crypto.createHmac("sha256", s).update(payload).digest("hex");
    return Buffer.from(`${payload}.${sig}`).toString("base64url");
  }

  it("accepts a correctly-signed state and returns the workspace id", () => {
    const state = sign("ws-123", "nonce-abc");
    expect(verifyState(state, secret)).toEqual({ workspaceId: "ws-123" });
  });

  it("rejects a state signed with the wrong secret", () => {
    const state = sign("ws-123", "nonce-abc", "wrong-secret");
    expect(verifyState(state, secret)).toBeNull();
  });

  it("rejects a tampered workspace id even if the rest is untouched", () => {
    const state = sign("ws-123", "nonce-abc");
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const [, nonce, sig] = decoded.split(".");
    const tampered = Buffer.from(`ws-attacker.${nonce}.${sig}`).toString("base64url");
    expect(verifyState(tampered, secret)).toBeNull();
  });

  it("rejects malformed or non-base64url input without throwing", () => {
    expect(verifyState("not-valid-at-all", secret)).toBeNull();
    expect(verifyState("", secret)).toBeNull();
  });
});

describe("verifyOAuthCallbackHmac", () => {
  const secret = "app-secret";

  function sign(params: Record<string, string>, s = secret) {
    const pairs = Object.entries(params).map(([k, v]) => `${k}=${v}`).sort();
    return crypto.createHmac("sha256", s).update(pairs.join("&")).digest("hex");
  }

  it("accepts Shopify's own sorted-and-joined param signature", () => {
    const params = { shop: "my-store.myshopify.com", code: "abc123", timestamp: "1700000000" };
    const hmac = sign(params);
    const query = new URLSearchParams({ ...params, hmac });
    expect(verifyOAuthCallbackHmac(query, secret)).toBe(true);
  });

  it("rejects a tampered param after the hmac was computed", () => {
    const params = { shop: "my-store.myshopify.com", code: "abc123" };
    const hmac = sign(params);
    const query = new URLSearchParams({ shop: "attacker-store.myshopify.com", code: "abc123", hmac });
    expect(verifyOAuthCallbackHmac(query, secret)).toBe(false);
  });

  it("rejects a missing hmac param", () => {
    const query = new URLSearchParams({ shop: "my-store.myshopify.com" });
    expect(verifyOAuthCallbackHmac(query, secret)).toBe(false);
  });

  it("excludes both hmac and signature params from the signed payload", () => {
    const params = { shop: "my-store.myshopify.com" };
    const hmac = sign(params);
    const query = new URLSearchParams({ ...params, signature: "whatever", hmac });
    expect(verifyOAuthCallbackHmac(query, secret)).toBe(true);
  });
});

describe("verifyShopifyWebhookHmac", () => {
  const secret = "app-secret";
  const body = JSON.stringify({ id: 123, total_price: "10.00" });

  function sign(rawBody: string, s = secret) {
    return crypto.createHmac("sha256", s).update(rawBody, "utf8").digest("base64");
  }

  it("accepts a correctly-signed webhook body", () => {
    expect(verifyShopifyWebhookHmac(body, sign(body), secret)).toBe(true);
  });

  it("rejects a body that doesn't match the signature (tampered payload)", () => {
    expect(verifyShopifyWebhookHmac(body + "x", sign(body), secret)).toBe(false);
  });

  it("rejects a signature computed with the wrong secret", () => {
    expect(verifyShopifyWebhookHmac(body, sign(body, "wrong-secret"), secret)).toBe(false);
  });

  it("rejects a missing signature header", () => {
    expect(verifyShopifyWebhookHmac(body, null, secret)).toBe(false);
  });
});

describe("extractOrderPhone", () => {
  it("prefers the top-level phone field", () => {
    expect(extractOrderPhone({ phone: "+91 98765 43210", customer: { phone: "911111111111" } })).toBe("919876543210");
  });

  it("falls back to customer phone, then shipping address phone", () => {
    expect(extractOrderPhone({ customer: { phone: "919876543210" } })).toBe("919876543210");
    expect(extractOrderPhone({ shipping_address: { phone: "919876543210" } })).toBe("919876543210");
  });

  it("returns null when no phone field has enough digits to be real", () => {
    expect(extractOrderPhone({})).toBeNull();
    expect(extractOrderPhone({ phone: "12345" })).toBeNull();
  });
});

describe("extractCheckoutPhone", () => {
  it("extracts digits-only from whichever phone field is present", () => {
    expect(extractCheckoutPhone({ phone: "+91-98765-43210" })).toBe("919876543210");
  });

  it("returns null with nothing to extract", () => {
    expect(extractCheckoutPhone({})).toBeNull();
  });
});

describe("isShopifyAppConfigured", () => {
  const original = { key: process.env.SHOPIFY_API_KEY, secret: process.env.SHOPIFY_API_SECRET };

  beforeEach(() => {
    delete process.env.SHOPIFY_API_KEY;
    delete process.env.SHOPIFY_API_SECRET;
  });

  afterEach(() => {
    if (original.key !== undefined) process.env.SHOPIFY_API_KEY = original.key; else delete process.env.SHOPIFY_API_KEY;
    if (original.secret !== undefined) process.env.SHOPIFY_API_SECRET = original.secret; else delete process.env.SHOPIFY_API_SECRET;
  });

  it("is false when either env var is missing", () => {
    expect(isShopifyAppConfigured()).toBe(false);
    process.env.SHOPIFY_API_KEY = "k";
    expect(isShopifyAppConfigured()).toBe(false);
  });

  it("is true once both are set", () => {
    process.env.SHOPIFY_API_KEY = "k";
    process.env.SHOPIFY_API_SECRET = "s";
    expect(isShopifyAppConfigured()).toBe(true);
  });
});

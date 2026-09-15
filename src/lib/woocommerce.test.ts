import crypto from "node:crypto";
import { describe, it, expect } from "vitest";
import { verifyWooWebhookSignature, extractWooOrderPhone } from "./woocommerce";

describe("verifyWooWebhookSignature", () => {
  const secret = "webhook-secret";
  const body = JSON.stringify({ id: 42, total: "199.00" });

  function sign(rawBody: string, s = secret) {
    return crypto.createHmac("sha256", s).update(rawBody, "utf8").digest("base64");
  }

  it("accepts a correctly-signed body", () => {
    expect(verifyWooWebhookSignature(body, sign(body), secret)).toBe(true);
  });

  it("rejects a tampered body", () => {
    expect(verifyWooWebhookSignature(body + "x", sign(body), secret)).toBe(false);
  });

  it("rejects the wrong per-workspace secret — this is the only auth on this route, so a wrong secret must not be treated as one of several valid ones", () => {
    expect(verifyWooWebhookSignature(body, sign(body, "someone-elses-secret"), secret)).toBe(false);
  });

  it("rejects a missing signature header", () => {
    expect(verifyWooWebhookSignature(body, null, secret)).toBe(false);
  });

  it("rejects an empty signature rather than a false pass on an empty computed hash", () => {
    expect(verifyWooWebhookSignature(body, "", secret)).toBe(false);
  });
});

describe("extractWooOrderPhone", () => {
  it("prefers billing phone over shipping phone", () => {
    expect(extractWooOrderPhone({ billing: { phone: "919876543210" }, shipping: { phone: "911111111111" } })).toBe("919876543210");
  });

  it("falls back to shipping phone when billing has none", () => {
    expect(extractWooOrderPhone({ shipping: { phone: "919876543210" } })).toBe("919876543210");
  });

  it("strips non-digit characters", () => {
    expect(extractWooOrderPhone({ billing: { phone: "+91 98765-43210" } })).toBe("919876543210");
  });

  it("returns null when there's no usable phone number", () => {
    expect(extractWooOrderPhone({})).toBeNull();
    expect(extractWooOrderPhone({ billing: { phone: "123" } })).toBeNull();
  });
});

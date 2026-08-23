import crypto from "node:crypto";

/**
 * WooCommerce needs no OAuth app on our side — the merchant creates the
 * webhook themselves (WooCommerce -> Settings -> Advanced -> Webhooks,
 * topic "Order created") and pastes the secret they set there into
 * Sendkar, then points the delivery URL at the per-workspace endpoint
 * Sendkar shows them. Same "self-serve credential" shape as WhatsApp's
 * system user token, just for a second platform.
 */

export function verifyWooWebhookSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const computed = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(computed);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export interface WooOrderPayload {
  number?: string;
  billing?: { phone?: string; first_name?: string };
  shipping?: { phone?: string };
}

export function extractWooOrderPhone(order: WooOrderPayload): string | null {
  const raw = order.billing?.phone || order.shipping?.phone;
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  return digits.length >= 10 ? digits : null;
}

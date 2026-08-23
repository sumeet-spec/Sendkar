import crypto from "node:crypto";

/**
 * One real, deep Shopify integration instead of ten shallow ones — matches
 * Instastarz's actual customer base (Instagram/e-commerce sellers) and
 * covers the single most-cited WATI use case: automatic order confirmations
 * a customer can reply to for support. Gated on SHOPIFY_API_KEY/SECRET —
 * these are Sendkar's own Shopify Partner app credentials (one app, every
 * workspace installs it into their own store), not per-workspace secrets.
 */

export class ShopifyNotConfiguredError extends Error {
  constructor() {
    super("Shopify integration isn't configured — set SHOPIFY_API_KEY and SHOPIFY_API_SECRET.");
    this.name = "ShopifyNotConfiguredError";
  }
}

const SCOPES = "read_orders,read_customers";
const API_VERSION = "2024-10";

export function isShopifyAppConfigured(): boolean {
  return Boolean(process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET);
}

function requireEnv(): { apiKey: string; apiSecret: string } {
  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  if (!apiKey || !apiSecret) throw new ShopifyNotConfiguredError();
  return { apiKey, apiSecret };
}

export function normalizeShopDomain(input: string): string {
  const trimmed = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return trimmed.endsWith(".myshopify.com") ? trimmed : `${trimmed}.myshopify.com`;
}

/** workspaceId travels inside a signed `state` param — safer than relying on the browser session surviving the Shopify redirect round-trip. */
function signState(workspaceId: string, nonce: string, secret: string): string {
  const payload = `${workspaceId}.${nonce}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyState(state: string, secret: string): { workspaceId: string } | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const [workspaceId, nonce, sig] = decoded.split(".");
    if (!workspaceId || !nonce || !sig) return null;
    const expected = crypto.createHmac("sha256", secret).update(`${workspaceId}.${nonce}`).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return { workspaceId };
  } catch {
    return null;
  }
}

export function buildInstallUrl(shopInput: string, workspaceId: string, appUrl: string): string {
  const { apiKey, apiSecret } = requireEnv();
  const shop = normalizeShopDomain(shopInput);
  const nonce = crypto.randomBytes(12).toString("hex");
  const state = signState(workspaceId, nonce, apiSecret);
  const params = new URLSearchParams({
    client_id: apiKey,
    scope: SCOPES,
    redirect_uri: `${appUrl}/api/shopify/callback`,
    state,
  });
  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

/** Shopify signs the OAuth callback's own query params — separate from, and computed differently than, the webhook body signature below. */
export function verifyOAuthCallbackHmac(params: URLSearchParams, secret: string): boolean {
  const hmac = params.get("hmac");
  if (!hmac) return false;
  const pairs: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key === "hmac" || key === "signature") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const computed = crypto.createHmac("sha256", secret).update(pairs.join("&")).digest("hex");
  const a = Buffer.from(hmac);
  const b = Buffer.from(computed);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Webhook bodies are signed with the app secret (base64), regardless of which shop sent them. */
export function verifyShopifyWebhookHmac(rawBody: string, hmacHeader: string | null, secret: string): boolean {
  if (!hmacHeader) return false;
  const computed = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(hmacHeader);
  const b = Buffer.from(computed);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function exchangeCodeForToken(shop: string, code: string): Promise<string> {
  const { apiKey, apiSecret } = requireEnv();
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: apiKey, client_secret: apiSecret, code }),
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !json.access_token) throw new Error(json.error ?? `Shopify token exchange failed (HTTP ${res.status})`);
  return json.access_token;
}

export async function registerOrderWebhook(shop: string, accessToken: string, callbackUrl: string): Promise<void> {
  const res = await fetch(`https://${shop}/admin/api/${API_VERSION}/webhooks.json`, {
    method: "POST",
    headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" },
    body: JSON.stringify({ webhook: { topic: "orders/create", address: callbackUrl, format: "json" } }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Failed to register the Shopify order webhook (HTTP ${res.status})`);
}

export interface ShopifyOrderPayload {
  name?: string; // e.g. "#1001"
  order_number?: number;
  phone?: string | null;
  customer?: { first_name?: string; phone?: string | null } | null;
  shipping_address?: { phone?: string | null } | null;
}

export function extractOrderPhone(order: ShopifyOrderPayload): string | null {
  const raw = order.phone || order.customer?.phone || order.shipping_address?.phone;
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  return digits.length >= 10 ? digits : null;
}

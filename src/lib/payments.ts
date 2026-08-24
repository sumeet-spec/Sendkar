/**
 * In-chat payment links — Razorpay and PayU, the two gateways Interakt
 * names as integrations. Same "off until configured" posture as every
 * other integration here: credentials live on the workspace row, and
 * every function throws PaymentsNotConfiguredError until they're set.
 */

export class PaymentsNotConfiguredError extends Error {
  constructor(provider: string) {
    super(`${provider} isn't connected for this workspace yet.`);
    this.name = "PaymentsNotConfiguredError";
  }
}

export interface CreatePaymentLinkInput {
  amountInRupees: number;
  description: string;
  contactPhoneE164Digits: string; // digits only, country code included — same shape as everywhere else in this repo
  referenceId: string; // our own id (e.g. the payment_links row id) for idempotency + reconciliation
}

export interface PaymentLinkResult {
  providerRef: string;
  url: string;
}

// ── Razorpay ─────────────────────────────────────────────────────────────
// Standard Payment Links API — a single authenticated POST returns a
// shareable, hosted checkout URL. Notifications are disabled on purpose:
// Sendkar sends the link itself over WhatsApp, a second SMS/email from
// Razorpay would be a confusing duplicate.

export async function createRazorpayPaymentLink(
  creds: { razorpay_key_id: string | null; razorpay_key_secret: string | null },
  input: CreatePaymentLinkInput,
): Promise<PaymentLinkResult> {
  if (!creds.razorpay_key_id || !creds.razorpay_key_secret) throw new PaymentsNotConfiguredError("Razorpay");

  const auth = Buffer.from(`${creds.razorpay_key_id}:${creds.razorpay_key_secret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/payment_links", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Math.round(input.amountInRupees * 100), // Razorpay wants paise, not rupees
      currency: "INR",
      description: input.description,
      customer: { contact: `+${input.contactPhoneE164Digits}` },
      reference_id: input.referenceId,
      notify: { sms: false, email: false },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const json = (await res.json()) as { id?: string; short_url?: string; error?: { description?: string } };
  if (!res.ok || json.error || !json.id || !json.short_url) {
    throw new Error(json.error?.description ?? `Razorpay rejected the request (HTTP ${res.status})`);
  }
  return { providerRef: json.id, url: json.short_url };
}

export async function checkRazorpayPaymentLinkStatus(
  creds: { razorpay_key_id: string | null; razorpay_key_secret: string | null },
  paymentLinkId: string,
): Promise<"pending" | "paid" | "expired" | "cancelled"> {
  if (!creds.razorpay_key_id || !creds.razorpay_key_secret) throw new PaymentsNotConfiguredError("Razorpay");
  const auth = Buffer.from(`${creds.razorpay_key_id}:${creds.razorpay_key_secret}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1/payment_links/${paymentLinkId}`, {
    headers: { Authorization: `Basic ${auth}` },
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json()) as { status?: string };
  if (json.status === "paid") return "paid";
  if (json.status === "expired") return "expired";
  if (json.status === "cancelled") return "cancelled";
  return "pending";
}

export async function verifyRazorpayWebhookSignature(rawBody: string, signatureHeader: string | null, webhookSecret: string): Promise<boolean> {
  if (!signatureHeader) return false;
  const crypto = await import("node:crypto");
  const computed = crypto.createHmac("sha256", webhookSecret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(computed);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ── PayU ─────────────────────────────────────────────────────────────────
// PayU's flow is a hash-signed redirect, not a REST call that hands back a
// hosted link the way Razorpay's does — this builds that redirect URL
// (Sendkar's own /pay/[txnid] page posts the signed form to PayU) rather
// than a raw payment_links API, which PayU only exposes to larger merchants.
// NOTE: the hash formula below follows PayU's publicly documented spec
// exactly, but hasn't been exercised against a real sandbox merchant account
// — verify one real payment end-to-end in PayU's test mode before relying on
// this in production, same as any payment code should be before going live.

export async function buildPayuPaymentRequest(
  creds: { payu_merchant_key: string | null; payu_salt: string | null },
  input: CreatePaymentLinkInput & { successUrl: string; failureUrl: string },
): Promise<{ action: string; fields: Record<string, string> }> {
  if (!creds.payu_merchant_key || !creds.payu_salt) throw new PaymentsNotConfiguredError("PayU");

  const crypto = await import("node:crypto");
  const txnid = input.referenceId;
  const amount = input.amountInRupees.toFixed(2);
  const productinfo = input.description;
  const firstname = "Customer";
  const email = "customer@sendkar.app"; // PayU requires a well-formed email even when we only have a phone number

  // PayU's documented hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
  const hashString = [
    creds.payu_merchant_key, txnid, amount, productinfo, firstname, email,
    "", "", "", "", "", "", "", "", "", "", // udf1-5 + 5 reserved empty fields, per spec
    creds.payu_salt,
  ].join("|");
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  return {
    action: "https://secure.payu.in/_payment", // PayU's live gateway endpoint; use test.payu.in for sandbox credentials
    fields: {
      key: creds.payu_merchant_key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone: input.contactPhoneE164Digits,
      surl: input.successUrl,
      furl: input.failureUrl,
      hash,
    },
  };
}

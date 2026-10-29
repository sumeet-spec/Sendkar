/**
 * How a customer pays a bill. A shop picks one of three ways: its own UPI ID (nothing to connect, the customer's
 * UPI app opens with the amount filled in), a connected Razorpay or PayU account (the gateway confirms payment by
 * itself), or any https payment link the shop pastes. Kept free of server code so it can be tested directly.
 */

export type PayMode = "upi" | "gateway" | "link";

export interface PayWorkspace {
  pay_mode: PayMode | null;
  upi_id: string | null;
  upi_name: string | null;
  manual_pay_link: string | null;
  razorpay_key_id: string | null;
  razorpay_key_secret: string | null;
  payu_merchant_key: string | null;
  payu_salt: string | null;
}

/** name@bank, e.g. sharma@okhdfc. Letters, digits, dot, dash and underscore before the @. */
const UPI_ID = /^[a-zA-Z0-9.\-_]{2,60}@[a-zA-Z][a-zA-Z0-9.]{1,40}$/;

export function cleanUpiId(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  return UPI_ID.test(v) ? v : null;
}

/** Only an https address, so a pasted link can never send a customer to a script or app link. */
export function cleanPayLink(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" && u.hostname.includes(".") ? u.toString() : null;
  } catch {
    return null;
  }
}

export function hasGateway(ws: Pick<PayWorkspace, "razorpay_key_id" | "razorpay_key_secret" | "payu_merchant_key" | "payu_salt">): boolean {
  return Boolean((ws.razorpay_key_id && ws.razorpay_key_secret) || (ws.payu_merchant_key && ws.payu_salt));
}

/** Whether the shop's chosen way to be paid is actually set up. Without it, a bill carries no Pay button. */
export function canCollect(ws: PayWorkspace): boolean {
  if (ws.pay_mode === "upi") return Boolean(ws.upi_id && cleanUpiId(ws.upi_id));
  if (ws.pay_mode === "gateway") return hasGateway(ws);
  if (ws.pay_mode === "link") return Boolean(ws.manual_pay_link && cleanPayLink(ws.manual_pay_link));
  return false;
}

/** The address that opens a customer's UPI app with the payee, amount and bill number filled in. */
export function upiUri(input: { upiId: string; payeeName: string; amount: number; note: string }): string {
  const q = new URLSearchParams({
    pa: input.upiId,
    pn: input.payeeName.slice(0, 40),
    am: input.amount.toFixed(2),
    cu: "INR",
    tn: input.note.slice(0, 40),
  });
  return `upi://pay?${q.toString()}`;
}

/** The public pay page for a bill, the address behind the "Pay now" button. */
export function payPageUrl(origin: string, payCode: string): string {
  return `${origin.replace(/\/$/, "")}/p/${payCode}`;
}

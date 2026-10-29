import type { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayPaymentLink } from "@/lib/payments";

type Admin = ReturnType<typeof createAdminClient>;

interface GatewayWorkspace {
  id: string;
  name: string;
  razorpay_key_id: string | null;
  razorpay_key_secret: string | null;
  payu_merchant_key: string | null;
  payu_salt: string | null;
}

/**
 * The gateway address a customer pays a bill at. One link is made per bill and reused on every later visit, so a
 * customer opening the page twice (or WhatsApp previewing it) never makes a second Razorpay link.
 * Razorpay gives its own hosted address; PayU goes through our /pay page, which builds its signed form.
 */
export async function ensureBillGatewayUrl(
  admin: Admin,
  ws: GatewayWorkspace,
  bill: { id: string; amount: number | string; phone: string; bill_no: string },
  origin: string,
): Promise<string | null> {
  const { data: existing } = await admin
    .from("payment_links").select("url, status").eq("bill_id", bill.id).eq("status", "pending").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (existing?.url) return existing.url;

  const provider = ws.razorpay_key_id && ws.razorpay_key_secret ? "razorpay" : ws.payu_merchant_key && ws.payu_salt ? "payu" : null;
  if (!provider) return null;

  const amount = Number(bill.amount);
  const { data: row } = await admin
    .from("payment_links")
    .insert({ workspace_id: ws.id, bill_id: bill.id, provider, provider_ref: "pending", amount, url: "" })
    .select("id").single();
  if (!row) return null;

  try {
    if (provider === "razorpay") {
      const link = await createRazorpayPaymentLink(ws, { amountInRupees: amount, description: `Bill ${bill.bill_no} to ${ws.name}`, contactPhoneE164Digits: bill.phone, referenceId: row.id });
      await admin.from("payment_links").update({ provider_ref: link.providerRef, url: link.url }).eq("id", row.id);
      return link.url;
    }
    const url = `${origin.replace(/\/$/, "")}/pay/${row.id}`;
    await admin.from("payment_links").update({ provider_ref: row.id, url }).eq("id", row.id);
    return url;
  } catch {
    await admin.from("payment_links").delete().eq("id", row.id);
    return null;
  }
}

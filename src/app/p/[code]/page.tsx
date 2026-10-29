import type { Metadata } from "next";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import { PAY_UI } from "@/lib/i18n/payUi";
import { formatRupees } from "@/lib/bills/renderBill";
import { canCollect, cleanPayLink, cleanUpiId, upiUri, type PayWorkspace } from "@/lib/bills/pay";
import { ensureBillGatewayUrl } from "@/lib/bills/payLink";
import { CopyUpi } from "./CopyUpi";

// A page for one person's bill: never indexed, never cached.
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Pay" };
export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 py-10 text-center">{children}</main>
  );
}

/**
 * Public, opened from the "Pay now" button on a bill. Nothing here is automatic: the customer taps to open their
 * UPI app or the gateway's page. (An auto-redirect to another domain is exactly the pattern that got this domain
 * flagged by a phishing scanner before, so a real tap is always required.)
 */
export default async function PayBillPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const admin = createAdminClient();

  const { data: bill } = code.length >= 8 && code.length <= 32
    ? await admin.from("bills").select("id, workspace_id, bill_no, amount, paid, phone, lang").eq("pay_code", code).maybeSingle()
    : { data: null };
  const lang = (LANGUAGES.some((l) => l.code === bill?.lang) ? bill?.lang : "en") as LanguageCode;
  const t = PAY_UI[lang];
  if (!bill) return <Shell><p className="text-[15px]">{PAY_UI.en.notFound}</p></Shell>;

  const [{ data: ws }, { data: kit }] = await Promise.all([
    admin.from("workspaces").select("id, name, pay_mode, upi_id, upi_name, manual_pay_link, razorpay_key_id, razorpay_key_secret, payu_merchant_key, payu_salt").eq("id", bill.workspace_id).single(),
    admin.from("brand_kits").select("name").eq("workspace_id", bill.workspace_id).maybeSingle(),
  ]);
  const shop = kit?.name?.trim() || ws?.name || "";
  const title = t.title.replace("{shop}", shop);
  const amount = Number(bill.amount);

  if (bill.paid) {
    return <Shell><h1 className="mb-2 text-xl font-semibold">{t.paid}</h1><p className="text-[14px] text-muted">{t.paidBody}</p></Shell>;
  }

  const pay = (ws ?? {}) as unknown as PayWorkspace;
  let action: { kind: "upi"; href: string; upiId: string } | { kind: "link"; href: string; label: string } | null = null;
  if (ws && canCollect(pay)) {
    if (pay.pay_mode === "upi") {
      const upiId = cleanUpiId(pay.upi_id ?? "");
      if (upiId) action = { kind: "upi", upiId, href: upiUri({ upiId, payeeName: pay.upi_name || shop, amount, note: `Bill ${bill.bill_no}` }) };
    } else if (pay.pay_mode === "link") {
      const link = cleanPayLink(pay.manual_pay_link ?? "");
      if (link) action = { kind: "link", href: link, label: t.payNow };
    } else if (pay.pay_mode === "gateway") {
      const h = await headers();
      const origin = process.env.NEXT_PUBLIC_APP_URL ?? `https://${h.get("host")}`;
      const url = await ensureBillGatewayUrl(admin, ws, bill, origin);
      if (url) action = { kind: "link", href: url, label: t.payNow };
    }
  }

  return (
    <Shell>
      <h1 className="mb-1 text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mb-5 text-[13px] text-muted">{t.bill.replace("{bill}", bill.bill_no)}</p>
      <div className="mb-6 w-full rounded-2xl border border-border p-5">
        <div className="text-[12px] text-faint">{t.amount}</div>
        <div className="text-3xl font-semibold">{formatRupees(amount)}</div>
      </div>

      {!action && <p className="text-[14px] text-muted">{t.unavailable}</p>}

      {action?.kind === "upi" && (
        <>
          <a href={action.href} className="mb-3 block w-full rounded-xl bg-green-600 px-5 py-3.5 text-[16px] font-semibold text-white">{t.payUpi}</a>
          <CopyUpi upiId={action.upiId} label={t.upiId} copy={t.copy} copied={t.copied} />
          <p className="mt-4 text-[12.5px] text-muted">{t.afterUpi}</p>
        </>
      )}
      {action?.kind === "link" && (
        <a href={action.href} className="mb-3 block w-full rounded-xl bg-green-600 px-5 py-3.5 text-[16px] font-semibold text-white" rel="noopener noreferrer">{action.label}</a>
      )}
      <p className="mt-6 text-[11.5px] text-faint">{t.secure}</p>
    </Shell>
  );
}

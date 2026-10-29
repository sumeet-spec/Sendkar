import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { BILL_UI } from "@/lib/i18n/billUi";
import { formatRupees } from "@/lib/bills/renderBill";
import { canSendFromWorkspace } from "@/lib/planGate";
import { BILL_IMPORT_UI } from "@/lib/i18n/billImportUi";
import { ORDER_UI } from "@/lib/i18n/orderUi";
import { BillForm } from "./BillForm";
import { DismissOrder } from "./DismissOrder";
import Link from "next/link";
import { SalesImport } from "./SalesImport";
import { FollowUps } from "./FollowUps";
import { FOLLOW_UI } from "@/lib/i18n/followUi";
import { ResendButton } from "./ResendButton";
import { MarkPaidButton } from "./MarkPaidButton";

interface BillRow {
  id: string;
  bill_no: string;
  customer_name: string;
  phone: string;
  amount: number | string;
  paid: boolean;
  send_status: "pending" | "sent" | "failed" | "not_sent";
  send_error: string | null;
  created_at: string;
}

// Pasting a day's sales bills and sends up to 40 customers in one go.
export const maxDuration = 60;

export default async function BillsPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderParam } = await searchParams;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const lang = await getCurrentLanguage();
  const t = BILL_UI[lang];
  const supabase = await createClient();

  const { data } = await supabase
    .from("bills")
    .select("id, bill_no, customer_name, phone, amount, paid, send_status, send_error, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<BillRow[]>();
  const rows = data ?? [];
  const { data: followups } = await supabase
    .from("templates")
    .select("id, language, body_text, status")
    .eq("workspace_id", workspace.id)
    .like("template_group", "sk_followup_%")
    .order("created_at", { ascending: false })
    .limit(20);
  const canSend = await canSendFromWorkspace(supabase, workspace);

  // What the shop sells (the form offers these names and fills in their prices) and orders the assistant took in chat.
  const [{ data: itemRows }, { data: orderRows }] = await Promise.all([
    supabase.from("shop_items").select("name, price").eq("workspace_id", workspace.id).eq("is_active", true).order("sort_order").limit(300),
    supabase.from("order_requests").select("id, items, note, contact_id, contacts(name, phone)").eq("workspace_id", workspace.id).eq("status", "new").order("created_at", { ascending: false }).limit(20),
  ]);
  const catalog = (itemRows ?? []).map((i) => ({ name: i.name as string, price: i.price === null ? null : Number(i.price) }));
  const orders = (orderRows ?? []).map((o) => {
    const c = (Array.isArray(o.contacts) ? o.contacts[0] : o.contacts) as { name: string | null; phone: string } | null;
    return { id: o.id as string, items: (o.items ?? []) as Array<{ name: string; qty: number }>, note: o.note as string | null, name: c?.name ?? "", phone: c?.phone ?? "" };
  });
  const chosen = orders.find((o) => o.id === orderParam);
  const prefill = chosen
    ? {
        orderId: chosen.id, phone: chosen.phone.replace(/^91/, ""), name: chosen.name,
        rows: chosen.items.map((i) => {
          const hit = catalog.find((c) => c.name.toLowerCase() === i.name.toLowerCase());
          return { name: i.name, qty: String(i.qty), rate: hit && hit.price !== null ? String(hit.price) : "" };
        }),
      }
    : undefined;
  const to = ORDER_UI[lang];

  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const todays = rows.filter((r) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(r.created_at)) === todayKey);
  const todayTotal = todays.reduce((s, r) => s + Number(r.amount), 0);

  const statusOf = (r: BillRow) =>
    r.send_status === "sent" ? { text: t.sent, cls: "border-accent text-accent" }
    : r.send_status === "failed" ? { text: t.failed, cls: "border-danger text-danger" }
    : r.send_status === "pending" ? { text: t.waiting, cls: "text-muted" }
    : { text: t.notSent, cls: "text-muted" };

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mb-5 text-[13px] text-muted">{t.intro}</p>

      <div className="mb-8">
        <h2 className="mb-2 text-[14px] font-medium">{t.newBill}</h2>
        {orders.length > 0 && (
          <div className="sk-card mb-4 max-w-xl p-4">
            <div className="text-[14px] font-medium">{to.title}</div>
            <p className="mb-2 text-[12.5px] text-faint">{to.hint}</p>
            {orders.map((o) => (
              <div key={o.id} className={`flex items-center justify-between gap-3 border-t border-border py-2 text-[13px] ${o.id === orderParam ? "text-accent" : ""}`}>
                <div className="min-w-0">
                  <div className="truncate font-medium">{o.name || `+${o.phone}`}</div>
                  <div className="truncate text-[12px] text-faint">{o.items.map((i) => `${i.qty} × ${i.name}`).join(", ")}</div>
                </div>
                <div className="flex flex-none items-center gap-3">
                  <Link href={`/bills?order=${o.id}`} className="text-[12.5px] text-accent hover:text-accent-hover">{to.make}</Link>
                  <DismissOrder id={o.id} label={to.dismiss} />
                </div>
              </div>
            ))}
          </div>
        )}
        <BillForm key={prefill?.orderId ?? "new"} t={t} defaultLang={lang} canSend={canSend} prefill={prefill} catalog={catalog} />
      </div>

      <FollowUps t={FOLLOW_UI[lang]} defaultLang={lang} rows={(followups ?? []).map((f) => ({ id: f.id, language: f.language, body: f.body_text ?? "", status: f.status }))} />

      <SalesImport t={t} ti={BILL_IMPORT_UI[lang]} defaultLang={lang} />

      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-[14px] font-medium">{t.allBills}</h2>
        {todays.length > 0 && <span className="text-[12.5px] text-faint">{t.todayTotal.replace("{n}", `${formatRupees(todayTotal)} · ${todays.length}`)}</span>}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-border py-8 text-center text-[13px] text-muted">{t.empty}</div>
      ) : (
        <div className="sk-card overflow-x-auto p-0">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[12px] text-faint">
                <th className="px-4 py-2.5 font-medium">{t.colBill}</th>
                <th className="px-4 py-2.5 font-medium">{t.colCustomer}</th>
                <th className="px-4 py-2.5 font-medium">{t.colAmount}</th>
                <th className="px-4 py-2.5 font-medium">{t.colStatus}</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const s = statusOf(r);
                return (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.bill_no}</div>
                      <div className="text-[12px] text-faint">{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(r.created_at))}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{r.customer_name || `+${r.phone}`}</div>
                      {r.customer_name && <div className="text-[12px] text-faint">+{r.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div>{formatRupees(Number(r.amount))}</div>
                      <div className={`text-[12px] ${r.paid ? "text-accent" : "text-danger"}`}>{r.paid ? t.paidTag : t.dueTag}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`sk-pill ${s.cls}`}>{s.text}</span>
                      {r.send_error && r.send_status !== "sent" && <div className="mt-1 max-w-[220px] text-[11.5px] text-muted">{r.send_error}</div>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <a href={`/api/bills/${r.id}/image`} target="_blank" rel="noreferrer" className="text-[12.5px] text-accent hover:text-accent-hover">{t.openBill}</a>
                        {r.send_status !== "sent" && <ResendButton id={r.id} label={t.sendAgain} />}
                        {!r.paid && <MarkPaidButton id={r.id} label={t.markPaid} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

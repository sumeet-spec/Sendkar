import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { BILL_UI } from "@/lib/i18n/billUi";
import { formatRupees } from "@/lib/bills/renderBill";
import { canSendFromWorkspace } from "@/lib/planGate";
import { BILL_IMPORT_UI } from "@/lib/i18n/billImportUi";
import { BillForm } from "./BillForm";
import { SalesImport } from "./SalesImport";
import { FollowUps } from "./FollowUps";
import { FOLLOW_UI } from "@/lib/i18n/followUi";
import { ResendButton } from "./ResendButton";

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

export default async function BillsPage() {
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
        <BillForm t={t} defaultLang={lang} canSend={canSend} />
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

import { createClient } from "@/lib/supabase/server";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { REMINDERS_UI } from "@/lib/i18n/remindersCopy";
import { getCurrentWorkspace } from "@/lib/workspace";
import { REMINDER_OFFSETS_DAYS, formatDueDate, formatInr, todayInIndia } from "@/lib/reminders";
import { ImportForm } from "./ImportForm";
import { TemplatePicker } from "./TemplatePicker";
import { RowActions } from "./RowActions";

interface Receivable {
  id: string;
  party_name: string;
  phone: string;
  amount: number | string;
  due_date: string;
  invoice_ref: string | null;
  status: string;
  reminders_sent: number;
  last_reminded_at: string | null;
  last_error: string | null;
}

function statusLabel(t: { stPaid: string; stStopped: string; stFailed: string; stOverdue: string; stOpen: string }, r: Receivable, today: string): { text: string; className: string } {
  if (r.status === "paid") return { text: t.stPaid, className: "border-accent text-accent" };
  if (r.status === "stopped") return { text: t.stStopped, className: "text-faint" };
  if (r.status === "failed") return { text: t.stFailed, className: "border-danger text-danger" };
  if (r.due_date < today) return { text: t.stOverdue, className: "border-danger text-danger" };
  return { text: t.stOpen, className: "text-muted" };
}

export default async function RemindersPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const t = REMINDERS_UI[await getCurrentLanguage()];
  const today = todayInIndia();

  const [{ data: receivables }, { data: templates }] = await Promise.all([
    supabase
      .from("receivables")
      .select("id, party_name, phone, amount, due_date, invoice_ref, status, reminders_sent, last_reminded_at, last_error")
      .eq("workspace_id", workspace.id)
      .order("status", { ascending: true })
      .order("due_date", { ascending: true })
      .limit(500)
      .returns<Receivable[]>(),
    supabase
      .from("templates")
      .select("id, name, language")
      .eq("workspace_id", workspace.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
  ]);

  const rows = receivables ?? [];
  const sum = (list: Receivable[]) => list.reduce((t, r) => t + Number(r.amount), 0);
  const open = rows.filter((r) => r.status === "open");
  const overdue = open.filter((r) => r.due_date < today);
  const paid = rows.filter((r) => r.status === "paid");

  const whatsappConnected = Boolean(workspace.whatsapp_phone_number_id && workspace.whatsapp_access_token);
  const hasGateway = Boolean(workspace.razorpay_key_id || workspace.payu_merchant_key);

  const count = (n: number) => (n === 1 ? t.billOne : t.billMany.replace("{n}", String(n)));
  const stats = [
    { label: t.outstanding, value: `₹${formatInr(sum(open))}`, sub: count(open.length) },
    { label: t.overdueLabel, value: `₹${formatInr(sum(overdue))}`, sub: count(overdue.length) },
    { label: t.collected, value: `₹${formatInr(sum(paid))}`, sub: t.paidSub.replace("{n}", String(paid.length)) },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mb-5 text-[13px] text-muted">{t.intro.replace("{days}", REMINDER_OFFSETS_DAYS.slice(2).map((d) => `${d}`).join(", "))}</p>

      {(!whatsappConnected || !workspace.reminder_template_id || !hasGateway) && (
        <div className="sk-card mb-5 flex flex-col gap-1.5 p-4 text-[13px]" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <div className="font-medium">{t.beforeTitle}</div>
          {!whatsappConnected && (
            <div>{t.connectA}<a href="/settings/channels" className="text-accent hover:text-accent-hover">{t.channelsLink}</a>{t.connectB}</div>
          )}
          {!workspace.reminder_template_id && <div>{t.needTemplate}</div>}
          {!hasGateway && (
            <div>{t.gwA}<a href="/settings/payments" className="text-accent hover:text-accent-hover">{t.paymentsLink}</a>{t.gwB}</div>
          )}
        </div>
      )}

      <div className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="sk-card p-4">
            <div className="text-[12px] text-faint">{s.label}</div>
            <div className="mt-1 text-lg font-semibold">{s.value}</div>
            <div className="text-[12px] text-faint">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <TemplatePicker t={t} templates={templates ?? []} currentId={workspace.reminder_template_id} />
        <ImportForm t={t} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-border py-10 text-center">
          <p className="text-muted">{t.emptyTitle}</p>
          <p className="mt-1 text-[12.5px] text-faint">{t.emptyHint}</p>
        </div>
      ) : (
        <div className="sk-card overflow-x-auto p-0">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[12px] text-faint">
                <th className="px-4 py-2.5 font-medium">{t.colCustomer}</th>
                <th className="px-4 py-2.5 font-medium">{t.colAmount}</th>
                <th className="px-4 py-2.5 font-medium">{t.colDue}</th>
                <th className="px-4 py-2.5 font-medium">{t.colStatus}</th>
                <th className="px-4 py-2.5 font-medium">{t.colReminders}</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const status = statusLabel(t, r, today);
                return (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.party_name}</div>
                      <div className="text-[12px] text-faint">+{r.phone}{r.invoice_ref ? ` · ${r.invoice_ref}` : ""}</div>
                    </td>
                    <td className="px-4 py-3">₹{formatInr(Number(r.amount))}</td>
                    <td className="px-4 py-3">{formatDueDate(r.due_date)}</td>
                    <td className="px-4 py-3">
                      <span className={`sk-pill ${status.className}`}>{status.text}</span>
                      {r.last_error && r.status !== "paid" && (
                        <div className="mt-1 max-w-[200px] text-[11.5px] text-danger">{r.last_error}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {r.reminders_sent >= REMINDER_OFFSETS_DAYS.length && r.status === "open"
                        ? t.allSent
                        : t.aOfB.replace("{a}", String(r.reminders_sent)).replace("{b}", String(REMINDER_OFFSETS_DAYS.length))}
                    </td>
                    <td className="px-4 py-3"><RowActions t={t} id={r.id} status={r.status} /></td>
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

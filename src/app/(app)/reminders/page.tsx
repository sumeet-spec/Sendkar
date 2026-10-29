import { createClient } from "@/lib/supabase/server";
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

function statusLabel(r: Receivable, today: string): { text: string; className: string } {
  if (r.status === "paid") return { text: "Paid", className: "border-accent text-accent" };
  if (r.status === "stopped") return { text: "Stopped", className: "text-faint" };
  if (r.status === "failed") return { text: "Failed", className: "border-danger text-danger" };
  if (r.due_date < today) return { text: "Overdue", className: "border-danger text-danger" };
  return { text: "Open", className: "text-muted" };
}

export default async function RemindersPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
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

  const stats = [
    { label: "Outstanding", value: `₹${formatInr(sum(open))}`, sub: `${open.length} bill${open.length === 1 ? "" : "s"}` },
    { label: "Overdue", value: `₹${formatInr(sum(overdue))}`, sub: `${overdue.length} bill${overdue.length === 1 ? "" : "s"}` },
    { label: "Collected", value: `₹${formatInr(sum(paid))}`, sub: `${paid.length} bill${paid.length === 1 ? "" : "s"} marked paid` },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Payment reminders</h1>
      <p className="mb-5 text-[13px] text-muted">
        Paste the bills you&apos;re waiting on and Sendkar reminds each customer on WhatsApp — 3 days before the due
        date, on it, then{" "}
        {REMINDER_OFFSETS_DAYS.slice(2).map((d) => `${d}`).join(", ")} days after — with a payment link, and stops
        the moment they pay or reply STOP.
      </p>

      {(!whatsappConnected || !workspace.reminder_template_id || !hasGateway) && (
        <div className="sk-card mb-5 flex flex-col gap-1.5 p-4 text-[13px]" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <div className="font-medium">Before reminders can go out</div>
          {!whatsappConnected && (
            <div>Connect your WhatsApp number in <a href="/settings/channels" className="text-accent hover:text-accent-hover">Channels</a>.</div>
          )}
          {!workspace.reminder_template_id && <div>Choose an approved reminder message below.</div>}
          {!hasGateway && (
            <div>
              No payment gateway is connected, so reminders will tell customers to reply instead of giving a link.
              Add Razorpay or PayU in <a href="/settings/payments" className="text-accent hover:text-accent-hover">Payments</a>.
            </div>
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
        <TemplatePicker templates={templates ?? []} currentId={workspace.reminder_template_id} />
        <ImportForm />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-border py-10 text-center">
          <p className="text-muted">No bills yet.</p>
          <p className="mt-1 text-[12.5px] text-faint">Paste your outstanding list above to start.</p>
        </div>
      ) : (
        <div className="sk-card overflow-x-auto p-0">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[12px] text-faint">
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Amount</th>
                <th className="px-4 py-2.5 font-medium">Due</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Reminders</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const status = statusLabel(r, today);
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
                        ? "All sent"
                        : `${r.reminders_sent} of ${REMINDER_OFFSETS_DAYS.length}`}
                    </td>
                    <td className="px-4 py-3"><RowActions id={r.id} status={r.status} /></td>
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

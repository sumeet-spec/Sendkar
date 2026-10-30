import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { CARE_UI } from "@/lib/i18n/careUi";
import { BILL_UI } from "@/lib/i18n/billUi";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { formatRupees } from "@/lib/bills/renderBill";
import { todayInIndia } from "@/lib/reminders";
import { DetailsForm, NoteForm, DoneButton } from "./ProfileForms";

const day = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(iso));
const ymdLabel = (ymd: string) => day(`${ymd}T06:00:00Z`);

interface Contact {
  id: string; phone: string; name: string | null; language: string | null; source: string | null; tags: string[] | null; auto_tags: string[] | null;
  opted_out: boolean | null; consent_at: string | null; birthday: string | null; anniversary: string | null; credit_limit: number | string | null;
}
interface Bill { id: string; bill_no: string; amount: number | string; paid: boolean; created_at: string }
interface Note { id: string; kind: "note" | "task"; body: string; due_date: string | null; done: boolean; created_at: string }
interface Msg { id: string; direction: "inbound" | "outbound"; body: string | null; created_at: string }

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const lang = await getCurrentLanguage();
  const t = CARE_UI[lang];
  const tb = BILL_UI[lang];
  const supabase = await createClient();

  const { data: contact } = await supabase
    .from("contacts")
    .select("id, phone, name, language, source, tags, auto_tags, opted_out, consent_at, birthday, anniversary, credit_limit")
    .eq("id", id).eq("workspace_id", workspace.id).maybeSingle<Contact>();
  if (!contact) notFound();

  const [{ data: bills }, { data: notes }, { data: messages }] = await Promise.all([
    supabase.from("bills").select("id, bill_no, amount, paid, created_at").eq("workspace_id", workspace.id).eq("contact_id", id).order("created_at", { ascending: false }).limit(50).returns<Bill[]>(),
    supabase.from("contact_notes").select("id, kind, body, due_date, done, created_at").eq("workspace_id", workspace.id).eq("contact_id", id).order("created_at", { ascending: false }).limit(60).returns<Note[]>(),
    supabase.from("messages").select("id, direction, body, created_at").eq("workspace_id", workspace.id).eq("contact_id", id).order("created_at", { ascending: false }).limit(15).returns<Msg[]>(),
  ]);

  const billList = bills ?? [];
  const total = billList.reduce((s, b) => s + Number(b.amount), 0);
  const owes = billList.filter((b) => !b.paid).reduce((s, b) => s + Number(b.amount), 0);
  const limit = contact.credit_limit === null ? null : Number(contact.credit_limit);
  const noteList = notes ?? [];
  const tasks = noteList.filter((n) => n.kind === "task" && !n.done).sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""));
  const history = noteList.filter((n) => !(n.kind === "task" && !n.done));
  const today = todayInIndia();
  const srcKey = (contact.source && contact.source in t.src ? contact.source : "other") as keyof typeof t.src;
  const langLabel = LANGUAGES.find((l) => l.code === contact.language)?.label ?? "—";
  const autoTags = (contact.auto_tags ?? []).filter((x): x is keyof typeof t.tag => x in t.tag);

  const stat = (label: string, value: string, danger = false) => (
    <div className="sk-card p-4">
      <div className="text-[12px] text-faint">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${danger ? "text-danger" : ""}`}>{value}</div>
    </div>
  );

  return (
    <div className="max-w-3xl">
      <Link href="/customers" className="mb-3 inline-block text-[13px] text-accent hover:text-accent-hover">← {t.back}</Link>
      <h1 className="text-xl font-semibold tracking-tight">{contact.name || t.noName}</h1>
      <p className="mb-3 text-[13px] text-muted">+{contact.phone} · {langLabel} · {t.source}: {t.src[srcKey]}</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {autoTags.map((tag) => <span key={tag} className={`sk-pill ${tag === "owes" || tag === "over_limit" ? "border-danger text-danger" : "border-accent text-accent"}`}>{t.tag[tag]}</span>)}
        {(contact.tags ?? []).map((tag) => <span key={tag} className="sk-pill">{tag}</span>)}
        <span className={`sk-pill ${contact.consent_at ? "border-accent text-accent" : "text-muted"}`}>{contact.consent_at ? t.consentYes : t.consentNo}</span>
        {contact.opted_out && <span className="sk-pill border-danger text-danger">{t.optedOut}</span>}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stat(t.totalBilled, formatRupees(total))}
        {stat(t.billCount, String(billList.length))}
        {stat(t.owes, formatRupees(owes), owes > 0)}
        {stat(t.lastBill, billList[0] ? day(billList[0].created_at) : t.never)}
      </div>
      {limit !== null && <p className={`-mt-3 mb-5 text-[12.5px] ${owes > limit ? "text-danger" : "text-faint"}`}>{t.creditLimit}: {formatRupees(limit)}</p>}

      <h2 className="mb-2 text-[14px] font-medium">{t.details}</h2>
      <div className="mb-6">
        <DetailsForm t={t} contactId={contact.id} birthday={contact.birthday ?? ""} anniversary={contact.anniversary ?? ""} creditLimit={limit === null ? "" : String(limit)} />
      </div>

      <h2 className="mb-2 text-[14px] font-medium">{t.notes}</h2>
      <NoteForm t={t} contactId={contact.id} />
      {tasks.length > 0 && (
        <div className="sk-card mb-3 divide-y divide-border p-0">
          {tasks.map((n) => (
            <div key={n.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
              <div className="min-w-0">
                <div className="truncate">{n.body}</div>
                <div className={`text-[12px] ${n.due_date && n.due_date < today ? "text-danger" : "text-faint"}`}>
                  {n.due_date ? ymdLabel(n.due_date) : ""}{n.due_date && n.due_date < today ? ` · ${t.overdue}` : ""}
                </div>
              </div>
              <DoneButton id={n.id} label={t.markDone} />
            </div>
          ))}
        </div>
      )}
      {history.length === 0 && tasks.length === 0 ? (
        <p className="mb-6 text-[12.5px] text-faint">{t.noNotes}</p>
      ) : (
        <div className="mb-6 flex flex-col gap-1.5">
          {history.map((n) => (
            <div key={n.id} className="rounded-lg border border-border px-3 py-2 text-[13px]">
              <div className={n.kind === "task" ? "text-faint line-through" : ""}>{n.body}</div>
              <div className="text-[11.5px] text-faint">{day(n.created_at)}</div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-2 text-[14px] font-medium">{t.bills}</h2>
      {billList.length === 0 ? (
        <p className="mb-6 text-[12.5px] text-faint">{t.noBills}</p>
      ) : (
        <div className="sk-card mb-6 divide-y divide-border p-0">
          {billList.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
              <span>{b.bill_no} · {day(b.created_at)}</span>
              <span className="flex items-center gap-3">
                <span className={b.paid ? "text-accent" : "text-danger"}>{formatRupees(Number(b.amount))} · {b.paid ? tb.paidTag : tb.dueTag}</span>
                <a href={`/api/bills/${b.id}/image`} target="_blank" rel="noreferrer" className="text-accent hover:text-accent-hover">{tb.openBill}</a>
              </span>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-2 text-[14px] font-medium">{t.messages}</h2>
      {(messages ?? []).length === 0 ? (
        <p className="text-[12.5px] text-faint">{t.noMessages}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {(messages ?? []).map((m) => (
            <div key={m.id} className="rounded-lg border border-border px-3 py-2 text-[13px]">
              <div className="text-[11.5px] text-faint">{m.direction === "outbound" ? t.shopSaid : t.customerSaid} · {day(m.created_at)}</div>
              <div className="whitespace-pre-wrap">{m.body ?? ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

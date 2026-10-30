import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { CUSTOMERS_UI } from "@/lib/i18n/customersUi";
import { BILL_UI } from "@/lib/i18n/billUi";
import { formatRupees } from "@/lib/bills/renderBill";
import { FOLLOW_UI } from "@/lib/i18n/followUi";
import { SendFollowup } from "./SendFollowup";
import { CareCard } from "./CareCard";
import { CARE_UI } from "@/lib/i18n/careUi";
import { todayInIndia } from "@/lib/reminders";
import { AUTO_TAGS, type AutoTag } from "@/lib/care/autoTags";
import { buildBook, filterBook, type BookBill, type BookContact, type BookTab } from "@/lib/bills/customerBook";

const TABS: BookTab[] = ["all", "customers", "leads", "owing"];
const ist = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).format(new Date(iso)).slice(0, 7);
const day = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(iso));

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ tab?: string; tag?: string }> }) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const { tab: tabParam, tag: tagParam } = await searchParams;
  const tagFilter = (AUTO_TAGS as string[]).includes(tagParam ?? "") ? (tagParam as AutoTag) : null;
  const tab = (TABS.find((x) => x === tabParam) ?? "all") as BookTab;
  const lang = await getCurrentLanguage();
  const t = CUSTOMERS_UI[lang];
  const tb = BILL_UI[lang];
  const supabase = await createClient();

  const { data: ready } = await supabase.from("templates").select("id, language, body_text").eq("workspace_id", workspace.id).like("template_group", "sk_followup_%").eq("status", "approved").order("created_at", { ascending: false }).limit(20);
  const followupOptions = (ready ?? []).map((f) => ({ id: f.id, label: `${f.language.toUpperCase()}: ${(f.body_text ?? "").slice(0, 40)}…` }));
  const tf = FOLLOW_UI[lang];
  const tc = CARE_UI[lang];
  const today = todayInIndia();

  // Follow-ups due, and whether the care messages have been set up with WhatsApp.
  const [{ data: dueTasks }, { data: careTemplates }] = await Promise.all([
    supabase.from("contact_notes").select("id, body, due_date, contact_id, contacts(name, phone)").eq("workspace_id", workspace.id).eq("kind", "task").eq("done", false).lte("due_date", today).order("due_date").limit(20),
    supabase.from("templates").select("id").eq("workspace_id", workspace.id).or("meta_template_name.like.sk_birthday_anniversary_%,meta_template_name.like.sk_reorder_item_%").limit(1),
  ]);

  const [{ data: contacts }, { data: bills }] = await Promise.all([
    supabase.from("contacts").select("id, phone, name, opted_out, consent_at, auto_tags, source, created_at").eq("workspace_id", workspace.id).eq("channel", "whatsapp").order("created_at", { ascending: false }).limit(3000).returns<BookContact[]>(),
    supabase.from("bills").select("id, contact_id, bill_no, amount, paid, created_at").eq("workspace_id", workspace.id).order("created_at", { ascending: false }).limit(10000).returns<BookBill[]>(),
  ]);

  const book = buildBook(contacts ?? [], bills ?? [], ist(new Date().toISOString()), ist);
  const rows = filterBook(book.entries, tab).filter((e) => !tagFilter || (e.contact.auto_tags ?? []).includes(tagFilter)).slice(0, 300);

  // Where customers came from.
  const sources = new Map<string, number>();
  for (const c of contacts ?? []) {
    const k = c.source && c.source in tc.src ? c.source : "other";
    sources.set(k, (sources.get(k) ?? 0) + 1);
  }
  const sourceRows = [...sources.entries()].sort((a, b) => b[1] - a[1]);
  const tasksDue = (dueTasks ?? []).map((n) => {
    const c = (Array.isArray(n.contacts) ? n.contacts[0] : n.contacts) as { name: string | null; phone: string } | null;
    return { id: n.id as string, body: n.body as string, due: n.due_date as string, contactId: n.contact_id as string, who: c?.name || (c ? `+${c.phone}` : "") };
  });
  const chipTags: AutoTag[] = ["regular", "lapsed", "big_spender", "owes", "over_limit", "new"];

  const stats = [
    { label: t.customers, value: String(book.customers) },
    { label: t.leads, value: String(book.leads) },
    { label: t.owing, value: `${formatRupees(book.owingTotal)} · ${book.owingCount}` },
    { label: t.billedMonth, value: formatRupees(book.billedThisMonth) },
  ];
  const tabLabel: Record<BookTab, string> = { all: t.tabAll, customers: t.tabCustomers, leads: t.tabLeads, owing: t.tabOwing };

  return (
    <div className="max-w-4xl">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{t.title}</h1>
        <Link href="/bills" className="sk-btn sk-btn-primary text-[13px]">{t.makeBill}</Link>
      </div>
      <p className="mb-5 text-[13px] text-muted">{t.intro}</p>

      <CareCard t={tc} birthdayOn={Boolean(workspace.birthday_wishes_enabled)} reorderOn={Boolean(workspace.reorder_nudges_enabled)} canSetUp={Boolean(workspace.whatsapp_phone_number_id && workspace.whatsapp_access_token)} setUpDone={(careTemplates ?? []).length > 0} />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="sk-card p-4">
            <div className="text-[12px] text-faint">{s.label}</div>
            <div className="mt-1 text-lg font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      {tasksDue.length > 0 && (
        <div className="sk-card mb-5 p-4">
          <div className="mb-1 text-[14px] font-medium">{tc.followUpsDue}</div>
          {tasksDue.map((n) => (
            <div key={n.id} className="flex items-center justify-between gap-3 border-t border-border py-2 text-[13px]">
              <Link href={`/customers/${n.contactId}`} className="min-w-0 truncate hover:text-accent"><span className="font-medium">{n.who}</span> · {n.body}</Link>
              <span className={`flex-none text-[12px] ${n.due < today ? "text-danger" : "text-faint"}`}>{n.due < today ? tc.overdue : ""}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {TABS.map((x) => (
          <Link key={x} href={x === "all" ? "/customers" : `/customers?tab=${x}`} className={`rounded-full border px-3 py-1.5 text-[13px] ${x === tab ? "border-accent text-accent" : "border-border text-muted"}`}>
            {tabLabel[x]}
          </Link>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {chipTags.map((x) => (
          <Link key={x} href={tagFilter === x ? `/customers${tab === "all" ? "" : `?tab=${tab}`}` : `/customers?${tab === "all" ? "" : `tab=${tab}&`}tag=${x}`} className={`rounded-full border px-2.5 py-1 text-[12px] ${tagFilter === x ? "border-accent text-accent" : "border-border text-faint"}`}>
            {tc.tag[x]}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-border py-8 text-center text-[13px] text-muted">{t.empty}</div>
      ) : (
        <div className="sk-card divide-y divide-border p-0">
          {rows.map((e) => (
            <details key={e.contact.id} className="group">
              <summary className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-[13px]">
                <div className="min-w-0">
                  <div className="truncate font-medium"><Link href={`/customers/${e.contact.id}`} className="hover:text-accent">{e.contact.name || t.noName}</Link> <span className="font-normal text-faint">+{e.contact.phone}</span></div>
                  <div className="text-[12px] text-faint">
                    {e.bills.length > 0 ? `${e.bills.length} ${t.colBills} · ${formatRupees(e.total)} · ${t.colLast}: ${day(e.lastBillAt!)}` : t.leadHint}
                    {e.contact.opted_out ? ` · ${t.optedOut}` : ""}
                  </div>
                  {(e.contact.auto_tags ?? []).filter((x): x is AutoTag => x in tc.tag).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(e.contact.auto_tags ?? []).filter((x): x is AutoTag => x in tc.tag).map((x) => <span key={x} className={`sk-pill ${x === "owes" || x === "over_limit" ? "border-danger text-danger" : ""}`}>{tc.tag[x]}</span>)}
                    </div>
                  )}
                </div>
                {e.owes > 0 && <span className="sk-pill border-danger text-danger">{t.colOwes} {formatRupees(e.owes)}</span>}
              </summary>
              {e.bills.length > 0 && (
                <div className="border-t border-border bg-black/5 px-4 py-2 text-[12.5px]">
                  <div className="mb-1 text-faint">{t.billsOf}</div>
                  {e.bills.slice(0, 20).map((b) => (
                    <div key={b.id} className="flex items-center justify-between py-1">
                      <span>{b.bill_no} · {day(b.created_at)}</span>
                      <span className="flex items-center gap-3">
                        <span className={b.paid ? "text-accent" : "text-danger"}>{formatRupees(Number(b.amount))} · {b.paid ? tb.paidTag : tb.dueTag}</span>
                        <a href={`/api/bills/${b.id}/image`} target="_blank" rel="noreferrer" className="text-accent hover:text-accent-hover">{tb.openBill}</a>
                      </span>
                    </div>
                  ))}
                  {e.contact.consent_at && !e.contact.opted_out && followupOptions.length > 0 && <SendFollowup t={tf} contactId={e.contact.id} templates={followupOptions} />}
                  {!e.contact.consent_at && <p className="mt-1 text-[12px] text-faint">{tf.noConsent}</p>}
                </div>
              )}
            </details>
          ))}
        </div>
      )}

      {sourceRows.length > 0 && (
        <div className="sk-card mt-6 p-4">
          <div className="mb-2 text-[14px] font-medium">{tc.sourcesTitle}</div>
          {sourceRows.map(([k, n]) => (
            <div key={k} className="flex items-center justify-between border-t border-border py-1.5 text-[13px] first:border-t-0">
              <span>{tc.src[k as keyof typeof tc.src]}</span>
              <span className="text-muted">{n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

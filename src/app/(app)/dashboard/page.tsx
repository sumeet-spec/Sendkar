import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ActivationChecklist } from "./ActivationChecklist";
import Link from "next/link";

const DAY_MS = 24 * 60 * 60 * 1000;
const MESSAGING_TIERS = [250, 1000, 10000, 100000];

/** A 7-value trend as an SVG polyline point string, oldest first. */
function sparklinePoints(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  return values.map((v, i) => `${(i * stepX).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`).join(" ");
}

function initial(name: string | null) {
  return (name?.trim()?.[0] ?? "").toUpperCase() || null;
}

export default async function DashboardPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const t = getDictionary(await getCurrentLanguage()).dashboard;

  const now = new Date().getTime();
  const sevenDaysAgo = new Date(now - 7 * DAY_MS).toISOString();

  const [{ count: contactCount }, { count: campaignCount }, { data: recipientStats }, { data: orders }, { count: approvedTemplateCount }, { data: recentMessages }] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id),
    supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id),
    supabase
      .from("campaign_recipients")
      .select("status, campaign_id, campaigns!inner(workspace_id)")
      .eq("campaigns.workspace_id", workspace.id),
    supabase
      .from("orders")
      .select("contact_id, total_amount, attributed_campaign_id, created_at, contacts(phone, name)")
      .eq("workspace_id", workspace.id),
    supabase.from("templates").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id).eq("status", "approved"),
    supabase.from("messages").select("created_at").eq("workspace_id", workspace.id).gte("created_at", sevenDaysAgo),
  ]);

  const total = recipientStats?.length ?? 0;
  const delivered = recipientStats?.filter((r) => r.status === "delivered" || r.status === "read").length ?? 0;
  const failed = recipientStats?.filter((r) => r.status === "failed").length ?? 0;
  // Out of recipients actually sent to so far, not the whole audience —
  // counting still-queued ones in the denominator understates the rate for
  // any campaign the cron hasn't finished working through yet.
  const concluded = recipientStats?.filter((r) => r.status !== "queued").length ?? 0;
  const deliveryRate = concluded > 0 ? Math.round((delivered / concluded) * 100) : null;

  // Last 7 days of overall messaging activity, bucketed by day — the trend
  // shown next to "messages sent," independent of the campaign-only count.
  const dayKeys = Array.from({ length: 7 }, (_, i) => new Date(now - (6 - i) * DAY_MS).toISOString().slice(0, 10));
  const countsByDay = new Map(dayKeys.map((d) => [d, 0]));
  for (const m of recentMessages ?? []) {
    const key = new Date(m.created_at as string).toISOString().slice(0, 10);
    if (countsByDay.has(key)) countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }
  const sparkValues = dayKeys.map((d) => countsByDay.get(d) ?? 0);
  const sparkHasActivity = sparkValues.some((v) => v > 0);

  // Revenue, scoped to the trailing 30 days with a comparison to the 30
  // days before that — the hero number needs a real trend, not a lifetime
  // total with no baseline to read it against.
  const currentWindowStart = now - 30 * DAY_MS;
  const previousWindowStart = now - 60 * DAY_MS;
  let revenue30d = 0;
  let attributedRevenue30d = 0;
  let revenuePrev30d = 0;
  for (const o of orders ?? []) {
    const t0 = new Date(o.created_at as string).getTime();
    const amount = Number(o.total_amount);
    if (t0 >= currentWindowStart) {
      revenue30d += amount;
      if (o.attributed_campaign_id) attributedRevenue30d += amount;
    } else if (t0 >= previousWindowStart) {
      revenuePrev30d += amount;
    }
  }
  const revenueTrendPct = revenuePrev30d > 0 ? Math.round(((revenue30d - revenuePrev30d) / revenuePrev30d) * 100) : null;

  // Top customers stay lifetime-value, not windowed — who has spent the
  // most with this business overall, not just in the last 30 days.
  const spendByContact = new Map<string, { phone: string; name: string | null; spend: number }>();
  for (const o of orders ?? []) {
    if (!o.contact_id) continue;
    const c = o.contacts as { phone?: string; name?: string } | null;
    const bucket = spendByContact.get(o.contact_id) ?? { phone: c?.phone ?? "—", name: c?.name ?? null, spend: 0 };
    bucket.spend += Number(o.total_amount);
    spendByContact.set(o.contact_id, bucket);
  }
  const topCustomers = Array.from(spendByContact.entries()).sort((a, b) => b[1].spend - a[1].spend).slice(0, 5);

  const configured = isWhatsAppConfigured(workspace);
  const hasRevenue = (orders?.length ?? 0) > 0;

  const checklistSteps = [
    { label: t.checklistConnect, done: configured, href: "/onboarding" },
    { label: t.checklistTemplate, done: (approvedTemplateCount ?? 0) > 0, href: "/templates" },
    { label: t.checklistContacts, done: (contactCount ?? 0) > 0, href: "/contacts" },
    { label: t.checklistCampaign, done: (campaignCount ?? 0) > 0, href: "/campaigns" },
  ];
  const checklistDone = checklistSteps.every((s) => s.done);

  const tierIndex = Math.max(0, MESSAGING_TIERS.indexOf(workspace.messaging_tier));
  const tierFillPct = Math.min(100, Math.round((workspace.daily_send_count / Math.max(1, workspace.messaging_tier)) * 100));

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{t.title}</h1>
        <div className="sk-pill">{configured ? t.whatsappConnected : t.whatsappNotConnected}</div>
      </div>

      {!configured && (
        <div className="sk-card mb-6 p-5" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm text-foreground">
            {t.noWhatsappBanner} <Link href="/onboarding" className="text-accent hover:text-accent-hover">Finish setup →</Link>
          </p>
        </div>
      )}

      {(hasRevenue || !checklistDone) && (
        <div className={hasRevenue && !checklistDone ? "mb-4 grid grid-cols-[1.6fr_1fr] gap-4" : "mb-4"}>
          {hasRevenue && (
            <div className="sk-card p-6">
              <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-faint">{t.revenueTracked}</div>
              <div className="flex items-baseline gap-3">
                <div className="font-mono text-[38px] font-semibold tracking-tight tabular-nums">
                  ₹{revenue30d.toLocaleString("en-IN")}
                </div>
                {revenueTrendPct !== null && (
                  <div
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                    style={{
                      background: revenueTrendPct >= 0 ? "var(--accent-glow)" : "rgba(248,113,113,0.14)",
                      color: revenueTrendPct >= 0 ? "var(--accent)" : "var(--danger)",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {revenueTrendPct >= 0 ? <path d="M2 7L5 3.2L8 7M5 3.2V8.5" /> : <path d="M2 3L5 6.8L8 3M5 6.8V1.5" />}
                    </svg>
                    {Math.abs(revenueTrendPct)}%
                  </div>
                )}
              </div>

              <div className="my-4 border-t border-border" />

              <div className="flex items-center justify-between text-[13px]">
                <div className="text-muted">
                  <span className="font-semibold text-foreground">₹{attributedRevenue30d.toLocaleString("en-IN")}</span> {t.fromCampaign.toLowerCase()}
                </div>
                {(campaignCount ?? 0) === 0 && (
                  <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:text-accent-hover">
                    {t.checklistCampaign}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 6h7M6 2.5L9.5 6L6 9.5" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          )}
          {!checklistDone && <ActivationChecklist title={t.checklistTitle} steps={checklistSteps} />}
        </div>
      )}

      <div className="sk-card mb-4 flex">
        <div className="flex-1 border-r border-border px-5 py-4">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{t.contacts}</div>
          <div className="font-mono text-[21px] font-semibold tabular-nums">{contactCount ?? 0}</div>
        </div>
        <div className="flex-1 border-r border-border px-5 py-4">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{t.campaigns}</div>
          <div className="font-mono text-[21px] font-semibold tabular-nums">{campaignCount ?? 0}</div>
        </div>
        <div className="flex flex-[1.3] items-center justify-between border-r border-border px-5 py-4">
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{t.messagesSent}</div>
            <div className="font-mono text-[21px] font-semibold tabular-nums">{total}</div>
          </div>
          {sparkHasActivity && (
            <svg width="64" height="26" viewBox="0 0 64 26" fill="none">
              <polyline points={sparklinePoints(sparkValues, 64, 26)} fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="flex-1 px-5 py-4">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{t.deliveryRate}</div>
          <div className="font-mono text-[21px] font-semibold tabular-nums" style={{ color: deliveryRate === null ? "var(--faint)" : undefined }}>
            {deliveryRate !== null ? `${deliveryRate}%` : "—"}
          </div>
          {failed > 0 && <div className="mt-1 text-[12px] text-danger">{failed} {t.failedSuffix}</div>}
        </div>
      </div>

      {topCustomers.length > 0 && (
        <div className="sk-card mb-4 overflow-hidden">
          <div className="border-b border-border px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-faint">{t.topCustomers}</div>
          <div className="flex flex-col">
            {topCustomers.map(([contactId, c]) => {
              const badge = initial(c.name);
              return (
                <div key={contactId} className="flex items-center gap-3 border-b border-border px-5 py-2.5 text-sm last:border-0">
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-mono text-[12px] font-bold"
                    style={
                      badge
                        ? { background: "var(--accent-glow)", color: "var(--accent)" }
                        : { background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--muted)" }
                    }
                  >
                    {badge ?? "#"}
                  </div>
                  <div className="flex-1">
                    {c.name && <div className="text-[13.5px] font-medium">{c.name}</div>}
                    <div className={`font-mono text-[13px] ${c.name ? "text-[11.5px] text-faint" : "text-foreground"}`}>{c.phone}</div>
                  </div>
                  <div className="font-mono text-[13.5px] font-semibold tabular-nums text-accent">₹{c.spend.toLocaleString("en-IN")}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="sk-card p-5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[11px] font-medium uppercase tracking-wide text-faint">{t.messagingTier}</div>
          <div className="font-mono text-[12px] tabular-nums text-muted">
            {workspace.daily_send_count} / {workspace.messaging_tier}
          </div>
        </div>
        <div className="mb-2.5 h-[7px] overflow-hidden rounded" style={{ background: "var(--border)" }}>
          <div className="h-full rounded" style={{ width: `${Math.max(tierFillPct, 2)}%`, background: "var(--accent)" }} />
        </div>
        <div className="flex gap-1.5">
          {MESSAGING_TIERS.map((tier, i) => (
            <div
              key={tier}
              className="flex-1 rounded py-1 text-center text-[11px] font-semibold"
              style={
                i === tierIndex
                  ? { background: "rgba(34,197,94,0.10)", color: "var(--accent)" }
                  : { color: "var(--faint)", fontWeight: 500 }
              }
            >
              {tier.toLocaleString("en-IN")}
            </div>
          ))}
        </div>
        <div className="mt-2.5 text-[11.5px] text-faint">
          Meta raises this cap as delivery quality stays high — it isn&apos;t something Sendkar controls.
        </div>
      </div>
    </div>
  );
}

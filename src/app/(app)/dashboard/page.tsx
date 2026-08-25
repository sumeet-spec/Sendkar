import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ActivationChecklist } from "./ActivationChecklist";
import {
  DAY_MS, MESSAGING_TIERS, computeDeliveryStats, bucketMessagesByDay, sparklinePoints,
  computeRevenueTrend, groupTopCustomers, initial, messagingTierFillPct, messagingTierIndex,
} from "@/lib/dashboardMetrics";
import Link from "next/link";

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

  const { total, failed, deliveryRate } = computeDeliveryStats(recipientStats ?? []);

  // Last 7 days of overall messaging activity — the trend shown next to
  // "messages sent," independent of the campaign-only count above.
  const sparkValues = bucketMessagesByDay((recentMessages ?? []).map((m) => m.created_at as string), now);
  const sparkHasActivity = sparkValues.some((v) => v > 0);

  const orderRows = orders ?? [];
  const { revenue30d, attributedRevenue30d, revenueTrendPct } = computeRevenueTrend(orderRows, now);
  const topCustomers = groupTopCustomers(orderRows.map((o) => ({ ...o, contacts: o.contacts as { phone?: string; name?: string } | null })));

  const configured = isWhatsAppConfigured(workspace);
  const hasRevenue = orderRows.length > 0;

  const checklistSteps = [
    { label: t.checklistConnect, done: configured, href: "/onboarding" },
    { label: t.checklistTemplate, done: (approvedTemplateCount ?? 0) > 0, href: "/templates" },
    { label: t.checklistContacts, done: (contactCount ?? 0) > 0, href: "/contacts" },
    { label: t.checklistCampaign, done: (campaignCount ?? 0) > 0, href: "/campaigns" },
  ];
  const checklistDone = checklistSteps.every((s) => s.done);

  const tierIndex = messagingTierIndex(workspace.messaging_tier);
  const tierFillPct = messagingTierFillPct(workspace.daily_send_count, workspace.messaging_tier);

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

      {configured && workspace.whatsapp_last_send_error && (
        <div className="sk-card mb-6 p-5" style={{ borderColor: "rgba(248,113,113,0.35)" }}>
          <p className="text-sm text-foreground">
            <span className="font-semibold" style={{ color: "var(--danger)" }}>Your WhatsApp connection is broken</span> — the last send failed with:{" "}
            <span className="font-mono text-[13px]">{workspace.whatsapp_last_send_error}</span>. Flows, automations, sequences, and away-messages have all
            stopped replying until this is fixed.{" "}
            <Link href="/settings/channels" className="text-accent hover:text-accent-hover">Reconnect in Channels →</Link>
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
            {topCustomers.map((c) => {
              const badge = initial(c.name);
              return (
                <div key={c.contactId} className="flex items-center gap-3 border-b border-border px-5 py-2.5 text-sm last:border-0">
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

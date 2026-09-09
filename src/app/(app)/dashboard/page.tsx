import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { isWhatsAppConfigured } from "@/lib/whatsapp";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ActivationChecklist } from "./ActivationChecklist";
import { DayChart } from "./DayChart";
import { RecentCampaigns } from "./RecentCampaigns";
import {
  DAY_MS,
  MESSAGING_TIERS,
  computeDeliveryStats,
  bucketMessagesByDay,
  computeRevenueTrend,
  groupTopCustomers,
  initial,
  messagingTierFillPct,
  messagingTierIndex,
  computeCampaignPerformance,
  computeTemplateHealth,
  formatCurrency,
  type CampaignInfoRow,
  type CampaignRecipientRow,
} from "@/lib/dashboardMetrics";
import Link from "next/link";

export default async function DashboardPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const t = getDictionary(await getCurrentLanguage()).dashboard;

  const now = new Date().getTime();
  const thirtyDaysAgo = new Date(now - 30 * DAY_MS).toISOString();

  const [
    { count: contactCount },
    { count: campaignCount },
    { data: recipientStats },
    { data: orders },
    { data: allTemplates },
    { data: recentMessages30 },
    { data: recentCampaigns },
  ] = await Promise.all([
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
    supabase.from("templates").select("status").eq("workspace_id", workspace.id),
    supabase.from("messages").select("created_at").eq("workspace_id", workspace.id).gte("created_at", thirtyDaysAgo),
    supabase
      .from("campaigns")
      .select("id, name, created_at, status")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Delivery stats (all-time, across all campaigns)
  const { total, failed, deliveryRate } = computeDeliveryStats(recipientStats ?? []);

  // 30-day message chart
  const chart30Values = bucketMessagesByDay(
    (recentMessages30 ?? []).map((m) => m.created_at as string),
    now,
    30,
  );
  const chart30Labels = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * DAY_MS);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  const chartHasActivity = chart30Values.some((v) => v > 0);
  const chart30Total = chart30Values.reduce((a, b) => a + b, 0);

  // Campaign performance rows (for table and AI insight)
  const campaignPerfRows = computeCampaignPerformance(
    (recentCampaigns ?? []) as CampaignInfoRow[],
    (recipientStats ?? []).map((r) => ({ campaign_id: r.campaign_id as string, status: r.status })) as CampaignRecipientRow[],
  );
  const bestCampaign = campaignPerfRows.reduce<(typeof campaignPerfRows)[0] | null>((best, c) => {
    if (c.deliveryRate === null) return best;
    if (best === null || (best.deliveryRate ?? -1) < c.deliveryRate) return c;
    return best;
  }, null);

  // Template health
  const templateHealth = computeTemplateHealth(allTemplates ?? []);
  const approvedTemplateCount = templateHealth.approved;

  // Revenue
  const orderRows = orders ?? [];
  const { revenue30d, attributedRevenue30d, revenueTrendPct } = computeRevenueTrend(orderRows, now);
  const topCustomers = groupTopCustomers(
    orderRows.map((o) => ({ ...o, contacts: o.contacts as { phone?: string; name?: string } | null })),
  );
  const hasRevenue = orderRows.length > 0;

  // Currency
  const currency = workspace.currency ?? "USD";

  // WhatsApp config
  const configured = isWhatsAppConfigured(workspace);

  // Activation checklist
  const checklistSteps = [
    { label: t.checklistConnect, done: configured, href: "/onboarding" },
    { label: t.checklistTemplate, done: approvedTemplateCount > 0, href: "/templates" },
    { label: t.checklistContacts, done: (contactCount ?? 0) > 0, href: "/contacts" },
    { label: t.checklistCampaign, done: (campaignCount ?? 0) > 0, href: "/campaigns" },
  ];
  const checklistDone = checklistSteps.every((s) => s.done);

  // Messaging tier
  const tierIndex = messagingTierIndex(workspace.messaging_tier);
  const tierFillPct = messagingTierFillPct(workspace.daily_send_count, workspace.messaging_tier);

  // AI insight — computed purely from available data
  let insight: string | null = null;
  if (total === 0) {
    insight = null; // hide until there's data
  } else if (deliveryRate !== null && deliveryRate >= 90) {
    insight = `${deliveryRate}% delivery rate — excellent sender reputation. Meta's tier promotion is based on this score.`;
  } else if (deliveryRate !== null && deliveryRate < 70) {
    insight = `Delivery rate is ${deliveryRate}%, below the healthy 85% threshold. Check for invalid numbers or spam reports.`;
  } else if (revenueTrendPct !== null && revenueTrendPct > 0) {
    insight = `Revenue is up ${revenueTrendPct}% vs last month — your campaigns are converting.`;
  } else if (bestCampaign && bestCampaign.deliveryRate !== null && bestCampaign.sent > 0) {
    insight = `"${bestCampaign.name}" delivered to ${bestCampaign.deliveryRate}% of recipients — your top-performing campaign.`;
  } else if (deliveryRate !== null) {
    insight = `${deliveryRate}% delivery rate across all campaigns. Above 85% is strong for WhatsApp marketing.`;
  }

  return (
    <div className="max-w-5xl">
      {/* ── Header ── */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="flex-1 text-xl font-semibold tracking-tight">{t.title}</h1>
        {configured && (
          <>
            <Link href="/campaigns" className="sk-btn sk-btn-ghost text-[12.5px]">
              + New campaign
            </Link>
            <Link href="/contacts" className="sk-btn sk-btn-ghost text-[12.5px]">
              + Import contacts
            </Link>
            <Link href="/templates" className="sk-btn sk-btn-ghost text-[12.5px]">
              + Template
            </Link>
          </>
        )}
        <div className="sk-pill">{configured ? t.whatsappConnected : t.whatsappNotConnected}</div>
      </div>

      {/* ── Alert: not configured ── */}
      {!configured && (
        <div className="sk-card mb-4 p-5" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm text-foreground">
            {t.noWhatsappBanner}{" "}
            <Link href="/onboarding" className="text-accent hover:text-accent-hover">
              Finish setup →
            </Link>
          </p>
        </div>
      )}

      {/* ── Alert: broken connection ── */}
      {configured && workspace.whatsapp_last_send_error && (
        <div className="sk-card mb-4 p-5" style={{ borderColor: "rgba(248,113,113,0.35)" }}>
          <p className="text-sm text-foreground">
            <span className="font-semibold" style={{ color: "var(--danger)" }}>
              WhatsApp connection broken
            </span>{" "}
            — last send failed: <span className="font-mono text-[13px]">{workspace.whatsapp_last_send_error}</span>.{" "}
            <Link href="/settings/channels" className="text-accent hover:text-accent-hover">
              Reconnect in Channels →
            </Link>
          </p>
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="sk-card mb-4 flex">
        <div className="flex-1 border-r border-border px-5 py-4">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{t.contacts}</div>
          <div className="font-mono text-[22px] font-semibold tabular-nums">{(contactCount ?? 0).toLocaleString()}</div>
        </div>
        <div className="flex-1 border-r border-border px-5 py-4">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{t.campaigns}</div>
          <div className="font-mono text-[22px] font-semibold tabular-nums">{(campaignCount ?? 0).toLocaleString()}</div>
        </div>
        <div className="flex flex-[1.3] items-center justify-between border-r border-border px-5 py-4">
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{t.messagesSent}</div>
            <div className="font-mono text-[22px] font-semibold tabular-nums">{total.toLocaleString()}</div>
            {chart30Total > 0 && (
              <div className="mt-0.5 text-[11px] text-faint">{chart30Total.toLocaleString()} last 30d</div>
            )}
          </div>
        </div>
        <div className="flex-1 px-5 py-4">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{t.deliveryRate}</div>
          <div
            className="font-mono text-[22px] font-semibold tabular-nums"
            style={{
              color:
                deliveryRate === null
                  ? "var(--faint)"
                  : deliveryRate >= 85
                    ? "var(--accent)"
                    : deliveryRate >= 70
                      ? "var(--foreground)"
                      : "var(--danger)",
            }}
          >
            {deliveryRate !== null ? `${deliveryRate}%` : "—"}
          </div>
          {failed > 0 && (
            <div className="mt-0.5 text-[12px] text-danger">
              {failed} {t.failedSuffix}
            </div>
          )}
        </div>
      </div>

      {/* ── 30-day message chart ── */}
      <div className="sk-card mb-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-faint">Messages sent — last 30 days</div>
          {chartHasActivity && (
            <div className="font-mono text-[12px] tabular-nums text-muted">{chart30Total.toLocaleString()} total</div>
          )}
        </div>
        <div className="px-2 py-3">
          {chartHasActivity ? (
            <DayChart values={chart30Values} labels={chart30Labels} />
          ) : (
            <div className="flex h-[128px] items-center justify-center text-[12px] text-faint">
              No messages sent in the last 30 days — start a campaign to see activity here.
            </div>
          )}
        </div>
      </div>

      {/* ── Recent campaigns + sidebar ── */}
      <div className="mb-4 grid grid-cols-[1.9fr_1fr] gap-4">
        {/* Recent campaigns */}
        <div className="sk-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-faint">Recent campaigns</div>
            <Link href="/campaigns" className="text-[11px] text-accent hover:text-accent-hover">
              View all →
            </Link>
          </div>
          <RecentCampaigns campaigns={campaignPerfRows} />
        </div>

        {/* Sidebar: template health + AI insight */}
        <div className="flex flex-col gap-4">
          {/* Template health */}
          <div className="sk-card p-4">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-faint">Templates</div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-muted">Approved</span>
                <span
                  className="font-mono text-[13px] font-semibold"
                  style={{ color: templateHealth.approved > 0 ? "var(--accent)" : "var(--faint)" }}
                >
                  {templateHealth.approved}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-muted">Pending review</span>
                <span className="font-mono text-[13px]" style={{ color: templateHealth.pending > 0 ? "var(--warn)" : "var(--faint)" }}>
                  {templateHealth.pending}
                </span>
              </div>
              {templateHealth.rejected > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-muted">Rejected</span>
                  <span className="font-mono text-[13px]" style={{ color: "var(--danger)" }}>
                    {templateHealth.rejected}
                  </span>
                </div>
              )}
            </div>
            {templateHealth.approved === 0 && templateHealth.pending === 0 && (
              <Link
                href="/templates"
                className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-accent hover:text-accent-hover"
              >
                Create your first template
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 6h7M6 2.5L9.5 6L6 9.5" />
                </svg>
              </Link>
            )}
          </div>

          {/* AI insight */}
          {insight && (
            <div className="sk-card p-4" style={{ borderColor: "rgba(34,197,94,0.2)" }}>
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
                AI insight
              </div>
              <p className="text-[12.5px] leading-relaxed text-foreground">{insight}</p>
            </div>
          )}

          {/* Activation checklist (sidebar when no revenue) */}
          {!checklistDone && !hasRevenue && (
            <ActivationChecklist title={t.checklistTitle} steps={checklistSteps} />
          )}
        </div>
      </div>

      {/* ── Revenue + top customers ── */}
      {hasRevenue && (
        <div className={!checklistDone ? "mb-4 grid grid-cols-[1.6fr_1fr] gap-4" : "mb-4"}>
          <div className="sk-card p-6">
              <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-faint">{t.revenueTracked}</div>
              <div className="flex items-baseline gap-3">
                <div className="font-mono text-[38px] font-semibold tracking-tight tabular-nums">
                  {formatCurrency(revenue30d, currency)}
                </div>
                {revenueTrendPct !== null && (
                  <div
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                    style={{
                      background: revenueTrendPct >= 0 ? "var(--accent-glow)" : "rgba(248,113,113,0.14)",
                      color: revenueTrendPct >= 0 ? "var(--accent)" : "var(--danger)",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {revenueTrendPct >= 0 ? (
                        <path d="M2 7L5 3.2L8 7M5 3.2V8.5" />
                      ) : (
                        <path d="M2 3L5 6.8L8 3M5 6.8V1.5" />
                      )}
                    </svg>
                    {Math.abs(revenueTrendPct)}%
                  </div>
                )}
              </div>
              <div className="my-4 border-t border-border" />
              <div className="text-[13px] text-muted">
                <span className="font-semibold text-foreground">{formatCurrency(attributedRevenue30d, currency)}</span>{" "}
                {t.fromCampaign.toLowerCase()}
              </div>
            </div>
          {!checklistDone && <ActivationChecklist title={t.checklistTitle} steps={checklistSteps} />}
        </div>
      )}

      {/* ── Top customers ── */}
      {topCustomers.length > 0 && (
        <div className="sk-card mb-4 overflow-hidden">
          <div className="border-b border-border px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-faint">
            {t.topCustomers}
          </div>
          <div className="flex flex-col">
            {topCustomers.map((c) => {
              const badge = initial(c.name);
              return (
                <div
                  key={c.contactId}
                  className="flex items-center gap-3 border-b border-border px-5 py-2.5 text-sm last:border-0"
                >
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
                    <div className={`font-mono text-[13px] ${c.name ? "text-[11.5px] text-faint" : "text-foreground"}`}>
                      {c.phone}
                    </div>
                  </div>
                  <div className="font-mono text-[13.5px] font-semibold tabular-nums text-accent">
                    {formatCurrency(c.spend, currency)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Messaging tier ── */}
      <div className="sk-card p-5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[11px] font-medium uppercase tracking-wide text-faint">{t.messagingTier}</div>
          <div className="font-mono text-[12px] tabular-nums text-muted">
            {workspace.daily_send_count.toLocaleString()} / {workspace.messaging_tier.toLocaleString()}
          </div>
        </div>
        <div className="mb-2.5 h-[7px] overflow-hidden rounded" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded"
            style={{ width: `${Math.max(tierFillPct, 2)}%`, background: "var(--accent)" }}
          />
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
              {tier.toLocaleString()}
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

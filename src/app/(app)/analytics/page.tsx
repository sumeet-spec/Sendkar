import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { formatCurrency } from "@/lib/dashboardMetrics";
import { AnalyticsFilters } from "./AnalyticsFilters";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function shortDate(key: string) {
  return new Date(key + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type SearchParams = Promise<{ days?: string }>;

export default async function AnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const { days: daysParam = "30" } = await searchParams;
  const DAYS = daysParam === "7" ? 7 : daysParam === "90" ? 90 : 30;

  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const currency = workspace.currency ?? "USD";

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - DAYS);

  const [
    { data: recentMessages },
    { data: recipientRows },
    { data: adContacts },
    { data: orders },
    { count: contactCountNow },
    { count: contactCountBefore },
    { data: optedOutRows },
  ] = await Promise.all([
    supabase
      .from("messages")
      .select("direction, created_at")
      .eq("workspace_id", workspace.id)
      .gte("created_at", since.toISOString()),
    supabase
      .from("campaign_recipients")
      .select("status, campaigns!inner(workspace_id, template_id, templates(name))")
      .eq("campaigns.workspace_id", workspace.id),
    supabase
      .from("contacts")
      .select("ad_headline")
      .eq("workspace_id", workspace.id)
      .not("ad_headline", "is", null),
    supabase
      .from("orders")
      .select("total_amount, attributed_campaign_id, campaigns(name)")
      .eq("workspace_id", workspace.id),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id)
      .lt("created_at", since.toISOString()),
    supabase
      .from("contacts")
      .select("opted_out")
      .eq("workspace_id", workspace.id),
  ]);

  // ── Revenue ──────────────────────────────────────────────────────────────
  const totalRevenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);
  const byCampaignRevenue = new Map<string, { name: string; revenue: number; orderCount: number }>();
  let organicRevenue = 0;
  for (const o of orders ?? []) {
    const campaign = o.campaigns as { name?: string } | null;
    if (!o.attributed_campaign_id || !campaign?.name) {
      organicRevenue += Number(o.total_amount);
      continue;
    }
    const bucket = byCampaignRevenue.get(o.attributed_campaign_id) ?? { name: campaign.name, revenue: 0, orderCount: 0 };
    bucket.revenue += Number(o.total_amount);
    bucket.orderCount += 1;
    byCampaignRevenue.set(o.attributed_campaign_id, bucket);
  }

  // ── Click-to-WhatsApp ads ─────────────────────────────────────────────
  const byAd = new Map<string, number>();
  for (const c of adContacts ?? []) {
    const headline = c.ad_headline ?? "Unknown ad";
    byAd.set(headline, (byAd.get(headline) ?? 0) + 1);
  }

  // ── Message volume by day ────────────────────────────────────────────
  const volumeByDay = new Map<string, { inbound: number; outbound: number }>();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    volumeByDay.set(dayKey(d), { inbound: 0, outbound: 0 });
  }
  for (const m of recentMessages ?? []) {
    const key = dayKey(new Date(m.created_at));
    const bucket = volumeByDay.get(key);
    if (!bucket) continue;
    if (m.direction === "inbound") bucket.inbound++;
    else bucket.outbound++;
  }
  const days = Array.from(volumeByDay.entries());
  const maxVolume = Math.max(1, ...days.map(([, v]) => v.inbound + v.outbound));

  const totalOutbound = days.reduce((sum, [, v]) => sum + v.outbound, 0);
  const totalInbound = days.reduce((sum, [, v]) => sum + v.inbound, 0);
  const replyRate = totalOutbound > 0 && totalInbound > 0 ? Math.round((totalInbound / totalOutbound) * 100) : null;

  // ── Contact growth ────────────────────────────────────────────────────
  const newContacts = (contactCountNow ?? 0) - (contactCountBefore ?? 0);

  // ── Opt-out rate ──────────────────────────────────────────────────────
  const totalContacts = contactCountNow ?? 0;
  const optedOutCount = (optedOutRows ?? []).filter((c) => c.opted_out).length;
  const optOutRate = totalContacts > 0 ? Math.round((optedOutCount / totalContacts) * 100) : null;

  // ── Template performance ──────────────────────────────────────────────
  const byTemplate = new Map<string, { sent: number; delivered: number; read: number; failed: number }>();
  for (const r of recipientRows ?? []) {
    const campaign = r.campaigns as { templates?: { name?: string } | null } | null;
    const name = campaign?.templates?.name ?? "Unknown";
    const bucket = byTemplate.get(name) ?? { sent: 0, delivered: 0, read: 0, failed: 0 };
    if (r.status === "sent" || r.status === "delivered" || r.status === "read") bucket.sent++;
    if (r.status === "delivered" || r.status === "read") bucket.delivered++;
    if (r.status === "read") bucket.read++;
    if (r.status === "failed") bucket.failed++;
    byTemplate.set(name, bucket);
  }
  const sortedTemplates = Array.from(byTemplate.entries()).sort((a, b) => b[1].sent - a[1].sent);

  // Label cadence: show every Nth label so they don't overlap
  const labelEvery = DAYS <= 14 ? 1 : DAYS <= 30 ? 7 : 14;

  return (
    <div className="max-w-4xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <Suspense>
          <AnalyticsFilters days={DAYS} />
        </Suspense>
      </div>

      {/* ── Summary tiles ── */}
      <div className="sk-card mb-6 grid grid-cols-3 divide-x divide-border">
        <div className="px-5 py-4">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Sent</div>
          <div className="font-mono text-[22px] font-semibold tabular-nums">{totalOutbound.toLocaleString()}</div>
          <div className="mt-0.5 text-[11px] text-faint">messages out in {DAYS}d</div>
        </div>
        <div className="px-5 py-4">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Replies</div>
          <div className="font-mono text-[22px] font-semibold tabular-nums">{totalInbound.toLocaleString()}</div>
          <div className="mt-0.5 text-[11px] text-faint">
            {replyRate !== null ? (
              <span style={{ color: replyRate >= 10 ? "var(--accent)" : "var(--faint)" }}>
                {replyRate}% reply rate
              </span>
            ) : "no outbound yet"}
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Revenue tracked</div>
          <div className="font-mono text-[22px] font-semibold tabular-nums">
            {totalRevenue > 0 ? formatCurrency(totalRevenue, currency) : "—"}
          </div>
          <div className="mt-0.5 text-[11px] text-faint">all-time attributed</div>
        </div>
      </div>

      {/* ── Contact growth + opt-out ── */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="sk-card px-5 py-4">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">New contacts</div>
          <div className="font-mono text-[28px] font-semibold tabular-nums" style={{ color: newContacts > 0 ? "var(--accent)" : "var(--foreground)" }}>
            +{newContacts.toLocaleString()}
          </div>
          <div className="mt-0.5 text-[12px] text-faint">in last {DAYS} days · {totalContacts.toLocaleString()} total</div>
        </div>
        <div className="sk-card px-5 py-4">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">Opt-out rate</div>
          <div
            className="font-mono text-[28px] font-semibold tabular-nums"
            style={{ color: optOutRate !== null && optOutRate > 5 ? "var(--danger)" : optOutRate !== null && optOutRate > 2 ? "var(--warn)" : "var(--foreground)" }}
          >
            {optOutRate !== null ? `${optOutRate}%` : "—"}
          </div>
          <div className="mt-0.5 text-[12px] text-faint">{optedOutCount.toLocaleString()} opted out · under 2% is healthy</div>
        </div>
      </div>

      {/* ── Message volume chart ── */}
      <div className="sk-card mb-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
            Message volume — last {DAYS} days
          </div>
          <div className="flex gap-4 text-[11px] text-faint">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: "var(--accent)" }} />
              Sent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: "var(--accent-dim)" }} />
              Received
            </span>
          </div>
        </div>
        <div className="px-4 pb-4 pt-4">
          <div className="flex h-36 items-end gap-px">
            {days.map(([key, v]) => {
              const total = v.inbound + v.outbound;
              const outboundH = total ? (v.outbound / maxVolume) * 100 : 0;
              const inboundH = total ? (v.inbound / maxVolume) * 100 : 0;
              return (
                <div key={key} className="group relative flex flex-1 flex-col items-center justify-end gap-px">
                  <div className="w-full rounded-t-sm" style={{ height: `${inboundH}%`, background: "var(--accent-dim)", minHeight: v.inbound ? 2 : 0 }} />
                  <div className="w-full rounded-t-sm" style={{ height: `${outboundH}%`, background: "var(--accent)", minHeight: v.outbound ? 2 : 0 }} />
                  <div className="pointer-events-none absolute bottom-full z-10 mb-1.5 hidden whitespace-nowrap rounded border border-border bg-[var(--surface-2)] px-2 py-1.5 text-[11px] shadow-sm group-hover:block">
                    <div className="font-medium text-foreground">{shortDate(key)}</div>
                    <div className="text-faint">{v.outbound} sent · {v.inbound} received</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex">
            {days.map(([key], i) => (
              <div key={key} className="flex-1 text-center text-[9px] text-faint">
                {i % labelEvery === 0 || i === days.length - 1 ? shortDate(key) : ""}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Template performance ── */}
      <div className="sk-card mb-6 overflow-hidden">
        <div className="border-b border-border px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-faint">
          Template performance (all-time)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Template", "Sent", "Delivery", "Read rate", "Failed"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTemplates.map(([name, stats]) => {
                const deliveryRate = stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : null;
                const readRate = stats.sent > 0 ? Math.round((stats.read / stats.sent) * 100) : null;
                return (
                  <tr key={name} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-medium">{name}</td>
                    <td className="px-4 py-2.5 font-mono text-[13px] tabular-nums">{stats.sent.toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      {deliveryRate !== null ? (
                        <span className="font-mono text-[13px] font-semibold tabular-nums" style={{ color: deliveryRate >= 85 ? "var(--accent)" : deliveryRate >= 70 ? "var(--foreground)" : "var(--danger)" }}>
                          {deliveryRate}%
                        </span>
                      ) : <span className="text-faint">—</span>}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[13px] tabular-nums text-muted">
                      {readRate !== null ? `${readRate}%` : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {stats.failed > 0 ? (
                        <span className="font-mono text-[13px] tabular-nums text-danger">{stats.failed}</span>
                      ) : <span className="text-faint">—</span>}
                    </td>
                  </tr>
                );
              })}
              {byTemplate.size === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[13px] text-muted">
                    No campaign sends yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Revenue by campaign ── */}
      {(orders?.length ?? 0) > 0 && (
        <div className="sk-card mb-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wide text-faint">Revenue by campaign</div>
            <span className="sk-pill border-accent text-accent">{formatCurrency(totalRevenue, currency)} total</span>
          </div>
          <div className="flex flex-col">
            {Array.from(byCampaignRevenue.entries())
              .sort((a, b) => b[1].revenue - a[1].revenue)
              .map(([id, c]) => {
                const pct = totalRevenue > 0 ? Math.round((c.revenue / totalRevenue) * 100) : 0;
                return (
                  <div key={id} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 truncate text-[13px]">{c.name}</div>
                      <div className="h-1 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 2)}%`, background: "var(--accent)" }} />
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="font-mono text-[13.5px] font-semibold tabular-nums text-accent">{formatCurrency(c.revenue, currency)}</div>
                      <div className="text-[11px] text-faint">{c.orderCount} sale{c.orderCount === 1 ? "" : "s"} · {pct}%</div>
                    </div>
                  </div>
                );
              })}
            {organicRevenue > 0 && (
              <div className="flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
                <span className="text-[13px] text-faint">Organic (no campaign attribution)</span>
                <span className="font-mono text-[13.5px] tabular-nums text-muted">{formatCurrency(organicRevenue, currency)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Click-to-WhatsApp ads ── */}
      {byAd.size > 0 && (
        <div className="sk-card overflow-hidden">
          <div className="border-b border-border px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-faint">
            Click-to-WhatsApp ads
          </div>
          <div className="flex flex-col">
            {Array.from(byAd.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([headline, count]) => (
                <div key={headline} className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-0">
                  <span className="text-[13px]">{headline}</span>
                  <span className="sk-pill border-accent text-accent">{count} contact{count === 1 ? "" : "s"}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";

const DAYS = 14;

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AnalyticsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - DAYS);

  const [{ data: recentMessages }, { data: recipientRows }, { data: adContacts }] = await Promise.all([
    supabase
      .from("messages")
      .select("direction, created_at")
      .eq("workspace_id", workspace.id)
      .gte("created_at", since.toISOString()),
    supabase
      .from("campaign_recipients")
      .select("status, campaigns!inner(workspace_id, template_id, templates(name))")
      .eq("campaigns.workspace_id", workspace.id),
    supabase.from("contacts").select("ad_headline").eq("workspace_id", workspace.id).not("ad_headline", "is", null),
  ]);

  const byAd = new Map<string, number>();
  for (const c of adContacts ?? []) {
    const headline = c.ad_headline ?? "Unknown ad";
    byAd.set(headline, (byAd.get(headline) ?? 0) + 1);
  }

  // ── Message volume by day, inbound vs outbound ──────────────────────────
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

  // ── Per-template performance ────────────────────────────────────────────
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

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Analytics</h1>

      <div className="sk-card mb-6 p-5">
        <div className="mb-4 text-[11px] font-medium uppercase tracking-wide text-faint">
          Message volume — last {DAYS} days
        </div>
        <div className="flex h-32 items-end gap-1">
          {days.map(([key, v]) => {
            const total = v.inbound + v.outbound;
            const outboundH = total ? (v.outbound / maxVolume) * 100 : 0;
            const inboundH = total ? (v.inbound / maxVolume) * 100 : 0;
            return (
              <div key={key} className="group relative flex flex-1 flex-col items-center justify-end gap-px">
                <div className="w-full rounded-t-sm" style={{ height: `${inboundH}%`, background: "var(--accent-dim)", minHeight: v.inbound ? 2 : 0 }} />
                <div className="w-full rounded-t-sm" style={{ height: `${outboundH}%`, background: "var(--accent)", minHeight: v.outbound ? 2 : 0 }} />
                <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-surface-2 px-2 py-1 text-[11px] group-hover:block">
                  {key}: {v.outbound} sent, {v.inbound} received
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex gap-4 text-[11.5px] text-faint">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-sm" style={{ background: "var(--accent)" }} /> Sent</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-sm" style={{ background: "var(--accent-dim)" }} /> Received</span>
        </div>
      </div>

      {byAd.size > 0 && (
        <div className="sk-card mb-6 overflow-hidden">
          <div className="border-b border-border p-4 text-[11px] font-medium uppercase tracking-wide text-faint">
            Contacts from click-to-WhatsApp ads
          </div>
          <div className="flex flex-col">
            {Array.from(byAd.entries()).map(([headline, count]) => (
              <div key={headline} className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm last:border-0">
                <span>{headline}</span>
                <span className="sk-pill border-accent text-accent">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sk-card overflow-hidden">
        <div className="border-b border-border p-4 text-[11px] font-medium uppercase tracking-wide text-faint">
          Template performance
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Template", "Sent", "Delivered", "Read rate", "Failed"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(byTemplate.entries()).map(([name, stats]) => (
              <tr key={name} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">{name}</td>
                <td className="px-4 py-2.5">{stats.sent}</td>
                <td className="px-4 py-2.5">{stats.delivered}</td>
                <td className="px-4 py-2.5">{stats.sent > 0 ? `${Math.round((stats.read / stats.sent) * 100)}%` : "—"}</td>
                <td className="px-4 py-2.5 text-danger">{stats.failed || ""}</td>
              </tr>
            ))}
            {byTemplate.size === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No campaign sends yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

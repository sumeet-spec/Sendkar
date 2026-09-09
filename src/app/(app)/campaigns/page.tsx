import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { NewCampaignForm } from "./NewCampaignForm";
import { AiStrategistPanel } from "./AiStrategistPanel";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Link from "next/link";

const STATUS_STYLE: Record<string, string> = {
  sending: "border-accent text-accent",
  completed: "bg-accent text-[#05130a] border-accent",
  paused: "border-warn text-warn",
  draft: "",
};

export default async function CampaignsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const dict = getDictionary(await getCurrentLanguage()).campaigns;

  const [
    { data: campaigns },
    { data: templates },
    { data: numbers },
    { data: segments },
    { data: allRecipients },
    { data: tagRows },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id, name, status, created_at, templates(name, language)")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
    // Only show approved templates — picking a rejected/pending one would fail at send time
    supabase
      .from("templates")
      .select("id, name, language, status, body_preview")
      .eq("workspace_id", workspace.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    supabase
      .from("whatsapp_numbers")
      .select("id, label")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("segments")
      .select("id, name")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("campaign_recipients")
      .select("campaign_id, status, campaigns!inner(workspace_id)")
      .eq("campaigns.workspace_id", workspace.id),
    supabase
      .from("contacts")
      .select("tags")
      .eq("workspace_id", workspace.id)
      .not("tags", "eq", "{}")
      .limit(500),
  ]);

  // Per-campaign delivery stats (for list cards)
  const recipientsByCampaign = new Map<string, { total: number; delivered: number; failed: number; concluded: number }>();
  for (const r of allRecipients ?? []) {
    const cid = r.campaign_id as string;
    const bucket = recipientsByCampaign.get(cid) ?? { total: 0, delivered: 0, failed: 0, concluded: 0 };
    bucket.total++;
    if (r.status === "delivered" || r.status === "read") bucket.delivered++;
    if (r.status === "failed") bucket.failed++;
    if (r.status !== "queued") bucket.concluded++;
    recipientsByCampaign.set(cid, bucket);
  }

  // Available tags for segment autocomplete
  const availableTags = [
    ...new Set((tagRows ?? []).flatMap((r) => (r.tags as string[] | null) ?? [])),
  ].sort();

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{dict.title}</h1>
        <NewCampaignForm
          templates={templates ?? []}
          numbers={numbers ?? []}
          segments={segments ?? []}
          availableTags={availableTags}
        />
      </div>

      {(templates?.length ?? 0) === 0 && (
        <div className="sk-card mb-4 p-4 text-[13px]" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          You need at least one approved template before creating a campaign.{" "}
          <Link href="/templates" className="text-accent hover:text-accent-hover">
            Create a template →
          </Link>
        </div>
      )}

      <AiStrategistPanel />

      <div className="flex flex-col gap-3">
        {(campaigns ?? []).map((c) => {
          const template = c.templates as { name?: string; language?: string } | null;
          const stats = recipientsByCampaign.get(c.id);
          const deliveryRate =
            stats && stats.concluded > 0 ? Math.round((stats.delivered / stats.concluded) * 100) : null;

          return (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="sk-card flex items-center gap-4 p-4 hover:border-accent-dim"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{c.name}</div>
                <div className="mt-0.5 text-[12.5px] text-faint">
                  {template?.name} · {template?.language} ·{" "}
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              {stats && stats.total > 0 && (
                <div className="flex-shrink-0 text-right">
                  <div className="font-mono text-[13px] tabular-nums">{stats.total.toLocaleString()}</div>
                  <div className="text-[10.5px] text-faint">recipients</div>
                </div>
              )}

              {deliveryRate !== null && (
                <div className="w-14 flex-shrink-0 text-right">
                  <div
                    className="font-mono text-[13px] font-semibold tabular-nums"
                    style={{
                      color:
                        deliveryRate >= 85
                          ? "var(--accent)"
                          : deliveryRate >= 70
                            ? "var(--foreground)"
                            : "var(--danger)",
                    }}
                  >
                    {deliveryRate}%
                  </div>
                  <div className="text-[10.5px] text-faint">delivery</div>
                </div>
              )}

              {stats && stats.failed > 0 && (
                <div className="flex-shrink-0 text-right">
                  <div className="font-mono text-[13px] tabular-nums text-danger">{stats.failed}</div>
                  <div className="text-[10.5px] text-faint">failed</div>
                </div>
              )}

              <span className={`sk-pill flex-shrink-0 ${STATUS_STYLE[c.status] ?? ""}`}>{c.status}</span>
            </Link>
          );
        })}
        {(!campaigns || campaigns.length === 0) && (
          <p className="py-10 text-center text-muted">{dict.noCampaigns}</p>
        )}
      </div>
    </div>
  );
}

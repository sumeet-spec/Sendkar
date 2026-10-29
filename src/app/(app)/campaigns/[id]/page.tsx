import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { CampaignControls } from "./StartButton";
import { TestSendForm } from "./TestSendForm";
import { CampaignActions } from "./CampaignActions";
import { RecipientTable } from "./RecipientTable";
import { VariableMappingForm } from "./VariableMappingForm";
import { notFound } from "next/navigation";
import { estimateCampaignCostInr, type TemplateCategory } from "@/lib/metaRates";
import { formatCurrency } from "@/lib/dashboardMetrics";
import { buildReport, type Counts } from "@/lib/deliveryReport";
import { CampaignProgress } from "./CampaignProgress";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { APP_COPY } from "@/lib/i18n/appCopy";
import { CAMPAIGN_COPY } from "@/lib/i18n/campaignCopy";

// Starting a campaign sends in the background of this page's request, for up to four minutes.
export const maxDuration = 300;

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ct = CAMPAIGN_COPY[await getCurrentLanguage()];
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const currency = workspace.currency ?? "USD";
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*, templates(name, language, meta_template_name, category, body_text)")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  if (!campaign) notFound();

  let groupLanguages: string[] = [];
  if (campaign.template_group) {
    const { data: groupTemplates } = await supabase
      .from("templates")
      .select("language")
      .eq("workspace_id", workspace.id)
      .eq("template_group", campaign.template_group);
    groupLanguages = [...new Set((groupTemplates ?? []).map((t) => t.language))];
  }

  const [{ data: recipients }, { data: orders }] = await Promise.all([
    supabase
      .from("campaign_recipients")
      .select("id, contact_id, status, error, sent_at, contacts(phone, name)")
      .eq("campaign_id", id)
      .order("sent_at", { ascending: false, nullsFirst: false })
      .limit(200),
    supabase.from("orders").select("total_amount").eq("attributed_campaign_id", id),
  ]);
  const revenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);

  const template = campaign.templates as {
    name?: string; language?: string; meta_template_name?: string; category?: string; body_text?: string;
  } | null;

  // Exact totals for the whole campaign: the table below only holds the latest 200 rows.
  const statuses = ["queued", "sent", "delivered", "read", "failed"] as const;
  const [statusCounts, { data: failedRows }] = await Promise.all([
    Promise.all(statuses.map((st) => supabase.from("campaign_recipients").select("id", { count: "exact", head: true }).eq("campaign_id", id).eq("status", st))),
    supabase.from("campaign_recipients").select("error").eq("campaign_id", id).eq("status", "failed").limit(3000),
  ]);
  const counts = Object.fromEntries(statuses.map((st, i) => [st, statusCounts[i].count ?? 0])) as Counts;
  const report = buildReport(counts, (failedRows ?? []).map((r) => r.error as string | null));

  const concluded = (counts.sent ?? 0) + (counts.delivered ?? 0) + (counts.read ?? 0) + (counts.failed ?? 0);
  const deliveredOrRead = (counts.delivered ?? 0) + (counts.read ?? 0);
  const deliveryRate = concluded > 0 ? Math.round((deliveredOrRead / concluded) * 100) : null;

  const { data: rateRows } = await supabase.from("meta_rate_card").select("category, price_inr").eq("country_code", "IN");
  let audienceCount = 0;
  if (campaign.status === "draft") {
    let countQuery = supabase.from("contacts").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id).eq("opted_out", false);
    if (campaign.template_group) {
      countQuery = groupLanguages.length > 0 ? countQuery.in("language", groupLanguages) : countQuery;
    } else if (template?.language) {
      countQuery = countQuery.eq("language", template.language);
    }
    if (campaign.segment_tag) countQuery = countQuery.contains("tags", [campaign.segment_tag]);
    const { count } = await countQuery;
    audienceCount = count ?? 0;
  } else {
    audienceCount = report.total;
  }

  const estimatedCost = template?.category
    ? estimateCampaignCostInr(audienceCount, template.category as TemplateCategory, rateRows ?? [])
    : 0;

  const isScheduled = campaign.scheduled_at && new Date(campaign.scheduled_at) > new Date();
  const variableMapping = (campaign.variable_mapping ?? {}) as Record<string, string>;

  return (
    <div className="max-w-4xl">
      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{campaign.name}</h1>
          <div className="mt-1 text-[13px] text-faint">
            {template?.name} · {template?.language} · <span className="font-mono">{template?.meta_template_name}</span>
          </div>
          {groupLanguages.length > 1 && (
            <div className="mt-1.5 text-[12px] text-accent">
              {ct.detail.multiLanguage.replace("{langs}", groupLanguages.join(", "))}
            </div>
          )}
          {isScheduled && (
            <div className="mt-1.5 text-[12px]" style={{ color: "var(--accent)" }}>
              {ct.detail.scheduledFor}{" "}
              {new Date(campaign.scheduled_at).toLocaleString(undefined, {
                weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </div>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
          <CampaignActions
            campaignId={campaign.id}
            failedCount={counts.failed ?? 0}
            status={campaign.status}
          />
          {campaign.status === "draft" && <TestSendForm campaignId={campaign.id} />}
          <CampaignControls campaignId={campaign.id} status={campaign.status} scheduledAt={campaign.scheduled_at} t={ct.controls} />
        </div>
      </div>

      {/* ── Variable mapping (draft or already sending) ── */}
      <VariableMappingForm
        campaignId={campaign.id}
        bodyText={template?.body_text}
        currentMapping={variableMapping}
        disabled={campaign.status !== "draft"}
      />

      {/* ── Meta cost estimate ── */}
      {audienceCount > 0 && (
        <div className="sk-card mb-6 flex items-center justify-between p-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
              {campaign.status === "draft" ? ct.detail.costBefore : ct.detail.costSoFar}
            </div>
            <p className="mt-1 text-[12px] text-faint">
              {ct.detail.costNote.replace("{n}", audienceCount.toLocaleString("en-IN")).replace("{cat}", template?.category ?? "—")}
            </p>
          </div>
          <div className="text-xl font-semibold text-accent">{formatCurrency(estimatedCost, currency)}</div>
        </div>
      )}

      <CampaignProgress report={report} status={campaign.status} t={APP_COPY[await getCurrentLanguage()].report} />

      {/* ── Status grid ── */}
      <div className="mb-6 grid grid-cols-6 gap-3">
        {statuses.map((s) => (
          <div key={s} className="sk-card p-4">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">{ct.detail[s]}</div>
            <div
              className="text-xl font-semibold"
              style={s === "failed" && (counts[s] ?? 0) > 0 ? { color: "var(--danger)" } : undefined}
            >
              {counts[s] ?? 0}
            </div>
          </div>
        ))}
        <div className="sk-card p-4">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">{ct.detail.delivery}</div>
          <div
            className="text-xl font-semibold"
            style={{
              color:
                deliveryRate === null ? "var(--faint)"
                : deliveryRate >= 85 ? "var(--accent)"
                : deliveryRate >= 70 ? "var(--foreground)"
                : "var(--danger)",
            }}
          >
            {deliveryRate !== null ? `${deliveryRate}%` : "—"}
          </div>
        </div>
      </div>

      {/* ── Revenue ── */}
      {revenue > 0 && (
        <div className="sk-card mb-6 p-4">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">{ct.detail.revenue}</div>
          <div className="text-xl font-semibold text-accent">{formatCurrency(revenue, currency)}</div>
          <p className="mt-1 text-[12px] text-faint">{ct.detail.revenueNote}</p>
        </div>
      )}

      {/* ── Recipients ── */}
      <RecipientTable
        campaignId={campaign.id}
        recipients={(recipients ?? []).map((r) => ({
          id: r.id,
          contact_id: r.contact_id as string | null,
          status: r.status,
          error: r.error as string | null,
          sent_at: r.sent_at as string | null,
          contacts: r.contacts as { phone?: string; name?: string } | null,
        }))}
      />
    </div>
  );
}

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

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const counts = (recipients ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

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
    audienceCount = recipients?.length ?? 0;
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
              Multi-language — auto-sends the right version to each contact ({groupLanguages.join(", ")})
            </div>
          )}
          {isScheduled && (
            <div className="mt-1.5 text-[12px]" style={{ color: "var(--accent)" }}>
              Scheduled for{" "}
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
          <CampaignControls campaignId={campaign.id} status={campaign.status} scheduledAt={campaign.scheduled_at} />
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
              {campaign.status === "draft" ? "Estimated Meta cost before you send" : "Meta cost so far"}
            </div>
            <p className="mt-1 text-[12px] text-faint">
              {audienceCount.toLocaleString("en-IN")} recipient{audienceCount === 1 ? "" : "s"} × {template?.category ?? "—"} rate — India,
              checked against Interakt&apos;s published card. Not your Sendkar subscription fee, this is what Meta itself charges.
            </p>
          </div>
          <div className="text-xl font-semibold text-accent">₹{estimatedCost.toLocaleString("en-IN")}</div>
        </div>
      )}

      {/* ── Status grid ── */}
      <div className="mb-6 grid grid-cols-6 gap-3">
        {["queued", "sent", "delivered", "read", "failed"].map((s) => (
          <div key={s} className="sk-card p-4">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">{s}</div>
            <div
              className="text-xl font-semibold"
              style={s === "failed" && (counts[s] ?? 0) > 0 ? { color: "var(--danger)" } : undefined}
            >
              {counts[s] ?? 0}
            </div>
          </div>
        ))}
        <div className="sk-card p-4">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">delivery</div>
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
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">Revenue attributed to this campaign</div>
          <div className="text-xl font-semibold text-accent">{formatCurrency(revenue, currency)}</div>
          <p className="mt-1 text-[12px] text-faint">Sales logged or synced within 7 days of a contact receiving this campaign.</p>
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

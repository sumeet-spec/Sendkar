import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { CampaignControls } from "./StartButton";
import { TestSendForm } from "./TestSendForm";
import { notFound } from "next/navigation";
import { estimateCampaignCostInr, type TemplateCategory } from "@/lib/metaRates";

const RECIPIENT_STATUS_STYLE: Record<string, string> = {
  delivered: "border-accent text-accent",
  read: "bg-accent text-[#05130a] border-accent",
  sent: "",
  queued: "text-faint",
  failed: "border-danger text-danger",
};

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*, templates(name, language, meta_template_name, category)")
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
      .select("id, status, error, sent_at, contacts(phone, name)")
      .eq("campaign_id", id)
      .order("sent_at", { ascending: false, nullsFirst: false })
      .limit(200),
    supabase.from("orders").select("total_amount").eq("attributed_campaign_id", id),
  ]);
  const revenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);

  const template = campaign.templates as { name?: string; language?: string; meta_template_name?: string; category?: string } | null;
  const counts = (recipients ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  // ── Cost transparency — an estimate before sending (draft), or actual
  // spend so far (once it's snapshotted real recipients). Neither Wati nor
  // Interakt show this inline on a campaign; it's shown here specifically
  // because Meta starts charging for service messages Oct 1, 2026 and
  // marketing/utility/authentication rates already apply today. ──────────
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

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{campaign.name}</h1>
          <div className="mt-1 text-[13px] text-faint">
            {template?.name} · {template?.language} · <span className="font-mono">{template?.meta_template_name}</span>
          </div>
          {groupLanguages.length > 1 && (
            <div className="mt-1.5 text-[12px] text-accent">
              Multi-language — auto-sends the right version to each contact ({groupLanguages.join(", ")})
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {campaign.status === "draft" && <TestSendForm campaignId={campaign.id} />}
          <CampaignControls campaignId={campaign.id} status={campaign.status} />
        </div>
      </div>

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

      <div className="mb-6 grid grid-cols-5 gap-3">
        {["queued", "sent", "delivered", "read", "failed"].map((s) => (
          <div key={s} className="sk-card p-4">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">{s}</div>
            <div className="text-xl font-semibold">{counts[s] ?? 0}</div>
          </div>
        ))}
      </div>

      {revenue > 0 && (
        <div className="sk-card mb-6 p-4">
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">Revenue attributed to this campaign</div>
          <div className="text-xl font-semibold text-accent">₹{revenue.toLocaleString("en-IN")}</div>
          <p className="mt-1 text-[12px] text-faint">Sales logged or synced within 7 days of a contact receiving this campaign.</p>
        </div>
      )}

      <div className="sk-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Phone", "Name", "Status", "Sent", "Error"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(recipients ?? []).map((r) => {
              const contact = r.contacts as { phone?: string; name?: string } | null;
              return (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[13px]">{contact?.phone}</td>
                  <td className="px-4 py-2.5 text-muted">{contact?.name ?? "—"}</td>
                  <td className="px-4 py-2.5"><span className={`sk-pill ${RECIPIENT_STATUS_STYLE[r.status] ?? ""}`}>{r.status}</span></td>
                  <td className="px-4 py-2.5 text-faint">{r.sent_at ? new Date(r.sent_at).toLocaleString() : "—"}</td>
                  <td className="px-4 py-2.5 text-danger text-[12px]">{r.error ?? ""}</td>
                </tr>
              );
            })}
            {(!recipients || recipients.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No recipients yet — start the campaign to snapshot the audience.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

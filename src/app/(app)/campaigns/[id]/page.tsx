import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { CampaignControls } from "./StartButton";
import { notFound } from "next/navigation";

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
    .select("*, templates(name, language, meta_template_name)")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  if (!campaign) notFound();

  const { data: recipients } = await supabase
    .from("campaign_recipients")
    .select("id, status, error, sent_at, contacts(phone, name)")
    .eq("campaign_id", id)
    .order("sent_at", { ascending: false, nullsFirst: false })
    .limit(200);

  const template = campaign.templates as { name?: string; language?: string; meta_template_name?: string } | null;
  const counts = (recipients ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{campaign.name}</h1>
          <div className="mt-1 text-[13px] text-faint">
            {template?.name} · {template?.language} · <span className="font-mono">{template?.meta_template_name}</span>
          </div>
        </div>
        <CampaignControls campaignId={campaign.id} status={campaign.status} />
      </div>

      <div className="mb-6 grid grid-cols-5 gap-3">
        {["queued", "sent", "delivered", "read", "failed"].map((s) => (
          <div key={s} className="sk-card p-4">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-faint">{s}</div>
            <div className="text-xl font-semibold">{counts[s] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="sk-card overflow-hidden">
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
  );
}

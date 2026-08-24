import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { WhatsAppForm, InstagramForm, MessengerForm } from "./ChannelForms";
import { AdditionalNumbers } from "./AdditionalNumbers";
import { EmbeddedSignupButton } from "./EmbeddedSignupButton";

export default async function ChannelsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const limits = getPlanLimits(workspace.plan);

  const { data: numbers } = await supabase
    .from("whatsapp_numbers")
    .select("id, label, phone_number_id, display_number")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  const { data: qualityHistory } = await supabase
    .from("quality_rating_history")
    .select("quality_rating, checked_at")
    .eq("workspace_id", workspace.id)
    .is("whatsapp_number_id", null)
    .order("checked_at", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Channels</h1>
      <div className="flex flex-col gap-5">
        <EmbeddedSignupButton workspaceId={workspace.id} />
        <WhatsAppForm workspace={workspace} />
        {qualityHistory && qualityHistory.length > 0 && (
          <div className="sk-card overflow-hidden">
            <div className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">
              Quality rating — last {qualityHistory.length} checks
            </div>
            {qualityHistory.map((row, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border px-4 py-2 text-[12.5px] last:border-0">
                <span className="text-faint">{new Date(row.checked_at).toLocaleDateString()}</span>
                <span
                  className={
                    row.quality_rating === "GREEN" ? "text-accent" : row.quality_rating === "YELLOW" ? "text-warn" : "text-danger"
                  }
                >
                  {row.quality_rating}
                </span>
              </div>
            ))}
          </div>
        )}
        <AdditionalNumbers numbers={numbers ?? []} />
        <InstagramForm workspace={workspace} locked={!limits.instagramEnabled} />
        <MessengerForm workspace={workspace} locked={!limits.instagramEnabled} />
      </div>
    </div>
  );
}

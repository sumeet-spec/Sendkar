import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits, effectivePlan, planLabel } from "@/lib/plans";
import { getNumberAllowance } from "@/lib/planUsage";
import { WhatsAppForm, InstagramForm, MessengerForm } from "./ChannelForms";
import { AdditionalNumbers } from "./AdditionalNumbers";
import { EmbeddedSignupButton } from "./EmbeddedSignupButton";

export default async function ChannelsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const limits = getPlanLimits(effectivePlan(workspace));

  const { data: numbers } = await supabase
    .from("whatsapp_numbers")
    .select("id, label, phone_number_id, display_number")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  const allowance = await getNumberAllowance(supabase, workspace);

  const { data: qualityHistory } = await supabase
    .from("quality_rating_history")
    .select("quality_rating, checked_at")
    .eq("workspace_id", workspace.id)
    .is("whatsapp_number_id", null)
    .order("checked_at", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Channels</h1>
      <p className="mb-6 text-[12.5px] text-faint">
        WhatsApp numbers: {allowance.connected} of {allowance.allowed} ({planLabel(effectivePlan(workspace))}).{" "}
        {!allowance.canAdd && <a href="/settings/billing" className="text-accent hover:text-accent-hover">See plans</a>}
      </p>
      <div className="flex flex-col gap-5">
        {/* Swapping the number that is already connected is always allowed; only a new connection needs room. */}
        <EmbeddedSignupButton workspaceId={workspace.id} blockedReason={workspace.whatsapp_phone_number_id ? null : allowance.blockedReason} />
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

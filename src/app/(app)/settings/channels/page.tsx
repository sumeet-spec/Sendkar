import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { CHANNELS_UI } from "@/lib/i18n/channelsCopy";
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
  const t = CHANNELS_UI[await getCurrentLanguage()];

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
      <h1 className="mb-1 text-xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mb-6 text-[12.5px] text-faint">
        {t.numbers.replace("{connected}", String(allowance.connected)).replace("{allowed}", String(allowance.allowed)).replace("{plan}", planLabel(effectivePlan(workspace)))}{" "}
        {!allowance.canAdd && <a href="/settings/billing" className="text-accent hover:text-accent-hover">{t.seePlans}</a>}
      </p>
      <div className="flex flex-col gap-5">
        {/* Swapping the number that is already connected is always allowed; only a new connection needs room. */}
        <EmbeddedSignupButton t={t} workspaceId={workspace.id} blockedReason={workspace.whatsapp_phone_number_id ? null : allowance.blockedReason} />
        <WhatsAppForm t={t} workspace={workspace} />
        {qualityHistory && qualityHistory.length > 0 && (
          <div className="sk-card overflow-hidden">
            <div className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-faint">
              {t.quality.replace("{n}", String(qualityHistory.length))}
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
        <AdditionalNumbers t={t} numbers={numbers ?? []} />
        <InstagramForm t={t} workspace={workspace} locked={!limits.instagramEnabled} />
        <MessengerForm t={t} workspace={workspace} locked={!limits.instagramEnabled} />
      </div>
    </div>
  );
}

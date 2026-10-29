import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentWorkspace } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/server";
import { getNumberAllowance } from "@/lib/planUsage";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const lang = await getCurrentLanguage();
  const t = getDictionary(lang).onboarding;

  // A free account has no WhatsApp number in its plan. Say so up front, with a way forward,
  // instead of showing a form that is guaranteed to be refused.
  const workspace = await getCurrentWorkspace();
  const allowance = workspace && !workspace.whatsapp_phone_number_id ? await getNumberAllowance(await createClient(), workspace) : null;
  if (allowance && !allowance.canAdd) {
    return (
      <div className="mx-auto mt-16 max-w-md px-6">
        <div className="sk-card p-6">
          <h1 className="text-lg font-semibold tracking-tight">Choose a plan to connect your WhatsApp number</h1>
          <p className="mt-2 text-[13.5px] text-muted">{allowance.blockedReason}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a href="/settings/billing" className="sk-btn sk-btn-primary">See plans</a>
            <a href="/dashboard" className="text-[13px] text-muted hover:text-foreground">Look around first</a>
          </div>
        </div>
      </div>
    );
  }

  return <OnboardingForm t={t} />;
}

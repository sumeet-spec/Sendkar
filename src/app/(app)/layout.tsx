import { redirect } from "next/navigation";
import { getCurrentWorkspace, listUserWorkspaces } from "@/lib/workspace";
import { Sidebar } from "@/components/Sidebar";
import { MobileTopBar } from "@/components/MobileTopBar";
import { CommandPalette } from "@/components/CommandPalette";
import { PageTransition } from "@/components/PageTransition";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { effectivePlan, trialDaysLeft, trialExpired } from "@/lib/plans";
import { TrialBanner } from "@/components/TrialBanner";
import { ExpiredGate } from "@/components/ExpiredGate";
import { GATE_COPY } from "@/lib/i18n/gateCopy";
import { createClient } from "@/lib/supabase/server";
import { isPhoneVerified, otpRequired } from "@/lib/phoneVerify";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [workspace, workspaces, lang] = await Promise.all([getCurrentWorkspace(), listUserWorkspaces(), getCurrentLanguage()]);
  if (!workspace) redirect("/login");
  // With number verification switched on, a new account sees nothing until it has entered its code.
  if (otpRequired()) {
    const { data: { user } } = await (await createClient()).auth.getUser();
    if (user && !isPhoneVerified(user)) redirect("/verify");
  }
  const dict = getDictionary(lang);
  const daysLeft = trialDaysLeft(workspace);
  const noPlan = effectivePlan(workspace) === "free";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileTopBar />
      <Sidebar workspaceId={workspace.id} workspaces={workspaces} nav={dict.nav} lang={lang} />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
        {daysLeft !== null && daysLeft > 0 && <TrialBanner daysLeft={daysLeft} />}
        <ExpiredGate expired={noPlan} wasTrial={trialExpired(workspace)} copy={GATE_COPY[lang]}>
          <PageTransition>{children}</PageTransition>
        </ExpiredGate>
      </main>
      <CommandPalette nav={dict.nav} />
      <PushNotificationPrompt />
    </div>
  );
}

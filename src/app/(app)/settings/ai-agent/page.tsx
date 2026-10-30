import { getCurrentWorkspace } from "@/lib/workspace";
import { getCurrentLanguage } from "@/lib/i18n/getLanguage";
import { AI_AGENT_UI } from "@/lib/i18n/settingsCopy";
import { getPlanLimits, effectivePlan } from "@/lib/plans";
import { AiAgentForm } from "./AiAgentForm";

export default async function AiAgentPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const t = AI_AGENT_UI[await getCurrentLanguage()];

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mb-3 text-sm text-muted">{t.intro}</p>
      <p className="mb-6 text-[12.5px] text-faint">
        {t.more1}<a href="/items" className="text-accent hover:text-accent-hover">{t.moreLink}</a>{t.more2}
      </p>
      <AiAgentForm
        t={t}
        initialEnabled={workspace.ai_agent_enabled}
        initialKnowledge={workspace.ai_agent_knowledge ?? ""}
        planAllowed={getPlanLimits(effectivePlan(workspace)).aiAgentEnabled}
      />
    </div>
  );
}

import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { AiAgentForm } from "./AiAgentForm";

export default async function AiAgentPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold tracking-tight">AI agent</h1>
      <p className="mb-6 text-sm text-muted">
        Answers customers on WhatsApp automatically, around the clock — not a drafted suggestion a human approves,
        an actual reply sent on its own.
      </p>
      <AiAgentForm
        initialEnabled={workspace.ai_agent_enabled}
        initialKnowledge={workspace.ai_agent_knowledge ?? ""}
        planAllowed={getPlanLimits(workspace.plan).aiAgentEnabled}
      />
    </div>
  );
}

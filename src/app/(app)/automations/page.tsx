import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { NewAutomationForm } from "./NewAutomationForm";
import { AutomationRow } from "./AutomationRow";
import { SuggestAutomations } from "./SuggestAutomations";

export default async function AutomationsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const limits = getPlanLimits(workspace.plan);

  const { data: automations } = await supabase
    .from("automations")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Automations</h1>
        <NewAutomationForm />
      </div>

      {!limits.automationsEnabled && (
        <div className="sk-card mb-5 p-4" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm">Automations need the Starter plan or above — <a href="/settings/billing" className="text-accent hover:text-accent-hover">upgrade</a>.</p>
        </div>
      )}

      <SuggestAutomations />

      <div className="flex flex-col gap-3">
        {(automations ?? []).map((a) => <AutomationRow key={a.id} automation={a} />)}
        {(!automations || automations.length === 0) && <p className="py-8 text-center text-muted">No automations yet.</p>}
      </div>
    </div>
  );
}

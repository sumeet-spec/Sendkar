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

  const activeCount = (automations ?? []).filter((a) => a.is_active).length;
  const total = (automations ?? []).length;

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Automations</h1>
          {total > 0 && (
            <span className={`sk-pill ${activeCount > 0 ? "border-accent text-accent" : "text-faint"}`}>
              {activeCount} of {total} active
            </span>
          )}
        </div>
        <NewAutomationForm />
      </div>

      {!limits.automationsEnabled && (
        <div className="sk-card mb-5 p-4" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm">
            Automations need the Starter plan or above —{" "}
            <a href="/settings/billing" className="text-accent hover:text-accent-hover">upgrade</a>.
          </p>
        </div>
      )}

      <SuggestAutomations />

      <div className="flex flex-col gap-3">
        {(automations ?? []).map((a) => <AutomationRow key={a.id} automation={a} />)}
        {(!automations || automations.length === 0) && (
          <div className="rounded-lg border border-border py-10 text-center">
            <p className="text-muted">No automations yet.</p>
            <p className="mt-1 text-[12.5px] text-faint">
              An automation fires a single instant reply when a contact sends a matching keyword.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

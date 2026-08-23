import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { NewFlowForm } from "./NewFlowForm";
import { FlowRow } from "./FlowRow";

export default async function FlowsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const limits = getPlanLimits(workspace.plan);

  const { data: flows } = await supabase
    .from("flows")
    .select("id, name, trigger_keyword, match_type, is_active, flow_steps(count)")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  const rows = (flows ?? []).map((f) => ({
    ...f,
    step_count: (f.flow_steps as unknown as [{ count: number }])?.[0]?.count ?? 0,
  }));

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Chatbot flows</h1>
        <NewFlowForm />
      </div>
      <p className="mb-5 text-sm text-muted">
        Multi-step, branching conversations — a keyword starts a flow, each step sends a message and routes the next
        step based on the reply. For a single fixed reply, use <a href="/automations" className="text-accent hover:text-accent-hover">Automations</a> instead.
      </p>

      {!limits.automationsEnabled && (
        <div className="sk-card mb-5 p-4" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm">Chatbot flows need the Starter plan or above — <a href="/settings/billing" className="text-accent hover:text-accent-hover">upgrade</a>.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((f) => <FlowRow key={f.id} flow={f} />)}
        {rows.length === 0 && <p className="py-8 text-center text-muted">No flows yet.</p>}
      </div>
    </div>
  );
}

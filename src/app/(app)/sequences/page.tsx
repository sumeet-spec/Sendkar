import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { getPlanLimits } from "@/lib/plans";
import { NewSequenceForm } from "./NewSequenceForm";
import { SequenceRow } from "./SequenceRow";

export default async function SequencesPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();
  const limits = getPlanLimits(workspace.plan);

  const { data: sequences } = await supabase
    .from("sequences")
    .select("id, name, trigger_type, trigger_keyword, is_active, sequence_steps(count)")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  const rows = (sequences ?? []).map((s) => ({
    ...s,
    step_count: (s.sequence_steps as unknown as [{ count: number }])?.[0]?.count ?? 0,
  }));

  const activeCount = rows.filter((s) => s.is_active).length;

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Sequences</h1>
          {rows.length > 0 && (
            <span className={`sk-pill ${activeCount > 0 ? "border-accent text-accent" : "text-faint"}`}>
              {activeCount} of {rows.length} active
            </span>
          )}
        </div>
        <NewSequenceForm />
      </div>
      <p className="mb-5 text-[13px] text-muted">
        Multi-step, delay-aware drips — a keyword, an abandoned cart, or a placed order enrolls a contact, and each
        step fires after its own delay. For a single instant reply, use{" "}
        <a href="/automations" className="text-accent hover:text-accent-hover">Automations</a> instead.
      </p>

      {!limits.automationsEnabled && (
        <div className="sk-card mb-5 p-4" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
          <p className="text-sm">
            Sequences need the Starter plan or above —{" "}
            <a href="/settings/billing" className="text-accent hover:text-accent-hover">upgrade</a>.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((s) => <SequenceRow key={s.id} sequence={s} />)}
        {rows.length === 0 && (
          <div className="rounded-lg border border-border py-10 text-center">
            <p className="text-muted">No sequences yet.</p>
            <p className="mt-1 text-[12.5px] text-faint">
              Add one above — each sequence can have multiple steps with configurable delays.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

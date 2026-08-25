import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { StepRow } from "./StepRow";
import { AddStepForm } from "./AddStepForm";

export default async function FlowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: flow } = await supabase.from("flows").select("*").eq("id", id).eq("workspace_id", workspace.id).maybeSingle();
  if (!flow) notFound();

  const { data: steps } = await supabase.from("flow_steps").select("*").eq("flow_id", id).order("step_order", { ascending: true });
  const nextStepOrder = (steps?.[steps.length - 1]?.step_order ?? 0) + 1;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">{flow.name}</h1>
      <p className="mb-6 text-[13px] text-faint">
        Triggers on <span className="font-mono text-accent">{flow.trigger_keyword}</span> ({flow.match_type})
      </p>

      <div className="flex flex-col gap-3">
        {(steps ?? []).map((s) => (
          <StepRow
            key={s.id}
            flowId={id}
            step={{ ...s, branches: (s.branches as Array<{ keyword: string; matchType: string; nextStepOrder: number; sourceVariable?: string }>) ?? [] }}
          />
        ))}
        {(!steps || steps.length === 0) && <p className="py-4 text-center text-muted">No steps yet — add the first one below.</p>}
      </div>

      <div className="mt-4">
        <AddStepForm flowId={id} nextStepOrder={nextStepOrder} />
      </div>
    </div>
  );
}

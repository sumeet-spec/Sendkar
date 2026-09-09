import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { StepRow } from "./StepRow";
import { AddStepForm } from "./AddStepForm";
import Link from "next/link";

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
      <Link href="/flows" className="mb-4 inline-block text-[13px] text-muted hover:text-foreground">← Chatbot flows</Link>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{flow.name}</h1>
          <p className="mt-1 text-[13px] text-faint">
            Triggers on <span className="font-mono text-accent">{flow.trigger_keyword}</span>
            <span className="ml-1.5 sk-pill text-faint">{flow.match_type}</span>
          </p>
        </div>
        <span className={`sk-pill flex-shrink-0 mt-1 ${flow.is_active ? "border-accent text-accent" : "text-faint"}`}>
          {flow.is_active ? "Active" : "Inactive"}
        </span>
      </div>

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

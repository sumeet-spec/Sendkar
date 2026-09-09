import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { AddStepForm } from "./AddStepForm";
import { StepRow } from "./StepRow";
import Link from "next/link";

export default async function SequenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  const supabase = await createClient();

  const { data: sequence } = await supabase
    .from("sequences")
    .select("id, name, trigger_type, trigger_keyword, workspace_id")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .maybeSingle();
  if (!sequence) return <p className="text-muted">Sequence not found.</p>;

  const { data: steps } = await supabase
    .from("sequence_steps")
    .select("id, step_order, delay_minutes, message_body, include_payment_link")
    .eq("sequence_id", id)
    .order("step_order", { ascending: true });

  return (
    <div className="max-w-2xl">
      <Link href="/sequences" className="mb-4 inline-block text-[13px] text-muted hover:text-foreground">← Sequences</Link>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{sequence.name}</h1>
          <p className="mt-1 text-[13px] text-faint">
            Trigger: <span className="font-mono text-accent">{sequence.trigger_type}</span>
            {sequence.trigger_keyword && (
              <> · keyword <span className="font-mono text-accent">{sequence.trigger_keyword}</span></>
            )}
          </p>
        </div>
        <span className="sk-pill flex-shrink-0 mt-1 text-faint">
          {(steps ?? []).length} step{(steps ?? []).length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mb-5 flex flex-col gap-3">
        {(steps ?? []).map((s) => <StepRow key={s.id} step={s} sequenceId={id} />)}
        {(!steps || steps.length === 0) && (
          <div className="rounded-lg border border-border py-8 text-center text-muted">
            No steps yet — this sequence won&apos;t send anything until you add one below.
          </div>
        )}
      </div>

      <AddStepForm sequenceId={id} />
    </div>
  );
}

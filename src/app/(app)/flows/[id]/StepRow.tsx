"use client";

import { useTransition } from "react";
import { deleteFlowStep } from "../actions";

interface Branch {
  keyword: string;
  matchType: string;
  nextStepOrder: number;
}

interface Step {
  id: string;
  step_order: number;
  message_body: string;
  branches: Branch[];
  default_next_step_order: number | null;
}

export function StepRow({ step, flowId }: { step: Step; flowId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="sk-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="sk-pill border-accent text-accent">Step {step.step_order}</span>
        <button disabled={pending} onClick={() => startTransition(() => deleteFlowStep(step.id, flowId))} className="text-xs text-faint hover:text-danger">
          Delete
        </button>
      </div>
      <p className="mb-2 text-[13.5px]">{step.message_body}</p>
      {step.branches.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {step.branches.map((b, i) => (
            <span key={i} className="sk-pill">&quot;{b.keyword}&quot; → step {b.nextStepOrder}</span>
          ))}
        </div>
      )}
      <div className="mt-1.5 text-[11.5px] text-faint">
        {step.default_next_step_order ? `Otherwise → step ${step.default_next_step_order}` : "Otherwise → flow ends"}
      </div>
    </div>
  );
}

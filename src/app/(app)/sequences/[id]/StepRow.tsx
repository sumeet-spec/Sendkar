"use client";

import { useTransition } from "react";
import { deleteSequenceStep } from "../actions";

interface Step {
  id: string;
  step_order: number;
  delay_minutes: number;
  message_body: string;
  include_payment_link: boolean;
}

export function StepRow({ step, sequenceId }: { step: Step; sequenceId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="sk-card flex items-start justify-between gap-3 p-4">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
          Step {step.step_order} · {step.delay_minutes === 0 ? "sent immediately" : `after ${step.delay_minutes} min`}
        </div>
        <p className="mt-1 text-sm">{step.message_body}</p>
        {step.include_payment_link && <span className="sk-pill mt-2 border-accent text-accent">+ payment link</span>}
      </div>
      <button disabled={pending} onClick={() => startTransition(() => deleteSequenceStep(step.id, sequenceId))} className="text-xs text-faint hover:text-danger">
        Delete
      </button>
    </div>
  );
}

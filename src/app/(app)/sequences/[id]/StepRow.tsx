"use client";

import { useTransition } from "react";
import { deleteSequenceStep } from "../actions";

interface Step {
  id: string;
  step_order: number;
  delay_minutes: number;
  message_body: string;
  include_payment_link: boolean;
  template_id?: string | null;
}

/** 0 → "straight away", 10080 → "after 7 days", 90 → "after 90 min". */
function describeDelay(minutes: number): string {
  if (minutes === 0) return "sent immediately";
  if (minutes % 1440 === 0) return `after ${minutes / 1440} day${minutes === 1440 ? "" : "s"}`;
  if (minutes % 60 === 0) return `after ${minutes / 60} hour${minutes === 60 ? "" : "s"}`;
  return `after ${minutes} min`;
}

export function StepRow({ step, sequenceId }: { step: Step; sequenceId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="sk-card flex items-start justify-between gap-3 p-4">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
          Step {step.step_order} · {describeDelay(step.delay_minutes)}
        </div>
        <p className="mt-1 text-sm">{step.message_body}</p>
        {step.template_id && <span className="sk-pill mt-2 mr-2 border-accent text-accent">template</span>}
        {step.include_payment_link && <span className="sk-pill mt-2 border-accent text-accent">+ payment link</span>}
      </div>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm(`Delete step ${step.step_order}?`)) {
            startTransition(async () => { await deleteSequenceStep(step.id, sequenceId); });
          }
        }}
        className="text-xs text-faint hover:text-danger"
      >
        Delete
      </button>
    </div>
  );
}

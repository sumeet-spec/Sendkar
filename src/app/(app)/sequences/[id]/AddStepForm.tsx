"use client";

import { useActionState } from "react";
import { addSequenceStep } from "../actions";

export function AddStepForm({ sequenceId }: { sequenceId: string }) {
  const [state, formAction, pending] = useActionState(addSequenceStep, null);

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-4">
      <input type="hidden" name="sequenceId" value={sequenceId} />
      <div>
        <label className="sk-label">Send after (minutes from the previous step)</label>
        <input name="delayMinutes" type="number" min={0} defaultValue={0} className="sk-input w-40" />
      </div>
      <div>
        <label className="sk-label">Message</label>
        <textarea
          name="messageBody"
          required
          rows={2}
          className="sk-input"
          placeholder="Still want this? {{amount}} — {{checkout_url}}"
        />
        <p className="mt-1 text-[11.5px] text-faint">
          {"{{amount}}"} and {"{{checkout_url}}"} fill in from the triggering cart/order automatically.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="includePaymentLink" className="h-4 w-4 accent-[var(--accent)]" />
        Attach a Razorpay payment link to this step
      </label>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary self-start disabled:opacity-60">
        {pending ? "Adding…" : "Add step"}
      </button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}

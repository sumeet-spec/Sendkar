"use client";

import { useActionState, useState } from "react";
import { saveAiAgent } from "./actions";

export function AiAgentForm({
  initialEnabled,
  initialKnowledge,
  planAllowed,
}: {
  initialEnabled: boolean;
  initialKnowledge: string;
  planAllowed: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveAiAgent, null);
  const [enabled, setEnabled] = useState(initialEnabled);

  return (
    <form action={formAction} className="sk-card flex flex-col gap-4 p-5">
      <label className="flex items-center justify-between">
        <div>
          <div className="font-medium">Turn on the AI agent</div>
          <p className="text-[12.5px] text-faint">
            Replies to customer messages automatically when nothing else (a flow, a keyword automation) already
            answered — no human has to type it.
          </p>
        </div>
        <input
          type="checkbox"
          name="enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          disabled={!planAllowed}
          className="h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-border transition-colors checked:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>

      {!planAllowed && (
        <p className="rounded-md border border-warn/30 bg-warn/5 p-2.5 text-[12.5px] text-foreground">
          Needs the Growth plan or above — every reply the agent sends is a real AI request, priced accordingly.
        </p>
      )}

      <div>
        <label className="sk-label" htmlFor="knowledge">What the agent knows</label>
        <textarea
          id="knowledge"
          name="knowledge"
          rows={8}
          defaultValue={initialKnowledge}
          disabled={!planAllowed}
          placeholder={`Describe your business, prices, policies, FAQs — anything the agent should answer from.\n\nExample:\nWe are Priya Textiles, a saree and fabric shop in Surat. We ship all over India, 3-5 days delivery. Returns accepted within 7 days if unworn. We don't do international shipping yet.`}
          className="sk-input font-mono text-[12.5px] leading-relaxed disabled:opacity-50"
        />
        <p className="mt-1 text-[11.5px] text-faint">
          The agent only answers from what you write here — if a question needs something you haven&apos;t covered,
          it tells the customer a team member will follow up instead of guessing.
        </p>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-accent">Saved.</p>}

      <button type="submit" disabled={pending || !planAllowed} className="sk-btn sk-btn-primary w-fit disabled:opacity-60">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

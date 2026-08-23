"use client";

import { useActionState, useState } from "react";
import { createFlow } from "./actions";

export function NewFlowForm() {
  const [state, formAction, pending] = useActionState(createFlow, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">+ New flow</button>;
  }

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div>
        <label className="sk-label">Name</label>
        <input name="name" className="sk-input" placeholder="Support triage" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sk-label">Trigger keyword</label>
          <input name="triggerKeyword" className="sk-input" placeholder="help" required />
        </div>
        <div>
          <label className="sk-label">Match type</label>
          <select name="matchType" className="sk-input" defaultValue="contains">
            <option value="contains">Contains</option>
            <option value="exact">Exact match</option>
          </select>
        </div>
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Creating…" : "Create & add steps"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { createAutomation } from "./actions";

export function NewAutomationForm() {
  const [state, formAction, pending] = useActionState(createAutomation, null);
  const [open, setOpen] = useState(false);

  if (!open) return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">+ New automation</button>;

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div>
        <label className="sk-label">Name</label>
        <input name="name" className="sk-input" placeholder="Pricing auto-reply" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sk-label">Trigger keyword</label>
          <input name="triggerKeyword" className="sk-input" placeholder="price" required />
        </div>
        <div>
          <label className="sk-label">Match type</label>
          <select name="matchType" className="sk-input" defaultValue="contains">
            <option value="contains">Contains</option>
            <option value="exact">Exact match</option>
          </select>
        </div>
      </div>
      <div>
        <label className="sk-label">Auto-reply</label>
        <textarea name="replyBody" className="sk-input" rows={3} required />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Save automation"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

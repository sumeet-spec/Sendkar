"use client";

import { useActionState, useState } from "react";
import { createCannedResponse } from "./actions";

export function NewCannedResponseForm() {
  const [state, formAction, pending] = useActionState(createCannedResponse, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">
        + New canned response
      </button>
    );
  }

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div>
        <label className="sk-label">Shortcut</label>
        <input name="shortcut" className="sk-input font-mono text-sm" placeholder="pricing" required />
      </div>
      <div>
        <label className="sk-label">Reply body</label>
        <textarea name="body" className="sk-input" rows={3} required />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

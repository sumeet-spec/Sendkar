"use client";

import { useActionState, useState } from "react";
import { createAdditionalWorkspace } from "../workspace-actions";

export function NewWorkspaceForm() {
  const [state, formAction, pending] = useActionState(createAdditionalWorkspace, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">+ Add client</button>;
  }

  return (
    <form action={formAction} className="sk-card flex items-end gap-3 p-4">
      <div className="flex-1">
        <label className="sk-label">Client name</label>
        <input name="name" className="sk-input" placeholder="Acme Retail" required />
      </div>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
        {pending ? "Creating…" : "Create"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}

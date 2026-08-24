"use client";

import { useActionState, useState } from "react";
import { createWaFlow } from "./actions";

export function NewFormForm() {
  const [state, formAction, pending] = useActionState(createWaFlow, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">+ New form</button>;
  }

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div>
        <label className="sk-label">Name</label>
        <input name="name" className="sk-input" placeholder="Lead intake" required />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Creating…" : "Create & add screens"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

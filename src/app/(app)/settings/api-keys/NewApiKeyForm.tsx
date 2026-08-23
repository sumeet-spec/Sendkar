"use client";

import { useActionState, useState } from "react";
import { createApiKey } from "./actions";

export function NewApiKeyForm() {
  const [state, formAction, pending] = useActionState(createApiKey, null);
  const [open, setOpen] = useState(false);

  if (state?.success && state.plaintext) {
    return (
      <div className="sk-card p-5" style={{ borderColor: "rgba(34,197,94,0.4)" }}>
        <p className="mb-2 text-sm font-medium">Key created — copy it now, it won&apos;t be shown again:</p>
        <code className="block break-all rounded-md bg-surface-2 p-3 text-[13px] text-accent">{state.plaintext}</code>
        <button onClick={() => window.location.reload()} className="sk-btn sk-btn-ghost mt-3">Done</button>
      </div>
    );
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">+ New API key</button>;
  }

  return (
    <form action={formAction} className="sk-card flex items-end gap-3 p-4">
      <div className="flex-1">
        <label className="sk-label">Name</label>
        <input name="name" className="sk-input" placeholder="Claude MCP connector" required />
      </div>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
        {pending ? "Creating…" : "Create"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}

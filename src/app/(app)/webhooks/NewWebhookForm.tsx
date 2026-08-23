"use client";

import { useActionState, useState } from "react";
import { createOutboundWebhook } from "./actions";

const EVENTS = ["message.received", "campaign.completed", "contact.created"];

export function NewWebhookForm() {
  const [state, formAction, pending] = useActionState(createOutboundWebhook, null);
  const [open, setOpen] = useState(false);

  if (!open) return <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">+ New webhook</button>;

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div>
        <label className="sk-label">Endpoint URL</label>
        <input name="url" className="sk-input font-mono text-sm" placeholder="https://hooks.zapier.com/..." required />
      </div>
      <div>
        <label className="sk-label">Events</label>
        <div className="flex flex-col gap-1.5">
          {EVENTS.map((e) => (
            <label key={e} className="flex items-center gap-2 text-[13px] text-muted">
              <input type="checkbox" name={`event_${e}`} defaultChecked className="accent-accent" />
              <span className="font-mono">{e}</span>
            </label>
          ))}
        </div>
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Save webhook"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

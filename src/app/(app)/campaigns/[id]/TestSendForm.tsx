"use client";

import { useActionState, useState } from "react";
import { sendTestMessage } from "../actions";

export function TestSendForm({ campaignId }: { campaignId: string }) {
  const [state, formAction, pending] = useActionState(sendTestMessage, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="sk-btn sk-btn-ghost">
        Send test message
      </button>
    );
  }

  return (
    <form action={formAction} className="sk-card flex items-end gap-3 p-4">
      <input type="hidden" name="campaignId" value={campaignId} />
      <div className="flex-1">
        <label className="sk-label">Your phone number (with country code)</label>
        <input name="phone" className="sk-input font-mono text-sm" placeholder="919876543210" required />
      </div>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
        {pending ? "Sending…" : "Send test"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-accent">Sent — check your WhatsApp.</p>}
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { sendTestMessage } from "../actions";
import type { CampaignsMoreUi } from "@/lib/i18n/campaignsMoreCopy";


export function TestSendForm({ campaignId, t }: { campaignId: string; t: CampaignsMoreUi["test"] }) {
  const [state, formAction, pending] = useActionState(sendTestMessage, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="sk-btn sk-btn-ghost">
        {t.button}
      </button>
    );
  }

  return (
    <form action={formAction} className="sk-card flex items-end gap-3 p-4">
      <input type="hidden" name="campaignId" value={campaignId} />
      <div className="flex-1">
        <label className="sk-label">{t.phone}</label>
        <input name="phone" className="sk-input font-mono text-sm" placeholder="919876543210" required />
      </div>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
        {pending ? t.sending : t.send}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">{t.cancel}</button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-accent">{t.sent}</p>}
    </form>
  );
}

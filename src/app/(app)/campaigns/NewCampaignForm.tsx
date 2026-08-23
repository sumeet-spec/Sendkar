"use client";

import { useActionState, useState } from "react";
import { createCampaign } from "./actions";

interface Template {
  id: string;
  name: string;
  language: string;
  status: string;
}

export function NewCampaignForm({ templates }: { templates: Template[] }) {
  const [state, formAction, pending] = useActionState(createCampaign, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary" disabled={templates.length === 0}>
        + New campaign
      </button>
    );
  }

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div>
        <label className="sk-label">Campaign name</label>
        <input name="name" className="sk-input" placeholder="Instastarz launch — Hindi sellers" required />
      </div>
      <div>
        <label className="sk-label">Template</label>
        <select name="templateId" className="sk-input" required defaultValue="">
          <option value="" disabled>Select…</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.language}) — {t.status}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="sk-label">Segment tag (optional)</label>
        <input name="segmentTag" className="sk-input" placeholder="e.g. vip — leave blank for everyone in that language" />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Creating…" : "Create draft"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

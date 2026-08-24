"use client";

import { useActionState, useState } from "react";
import { createCampaign } from "./actions";

interface Template {
  id: string;
  name: string;
  language: string;
  status: string;
}

interface WhatsAppNumber {
  id: string;
  label: string;
}

interface Segment {
  id: string;
  name: string;
}

export function NewCampaignForm({ templates, numbers, segments }: { templates: Template[]; numbers: WhatsAppNumber[]; segments: Segment[] }) {
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
      {segments.length > 0 && (
        <div>
          <label className="sk-label">Or a saved segment (optional)</label>
          <select name="segmentId" className="sk-input" defaultValue="">
            <option value="">None</option>
            {segments.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <p className="mt-1 text-[11.5px] text-faint">Combined with the tag above if both are set — build multi-condition segments under <a href="/segments" className="text-accent hover:text-accent-hover">Segments</a>.</p>
        </div>
      )}
      {numbers.length > 0 && (
        <div>
          <label className="sk-label">Send from (optional — defaults to your primary number)</label>
          <select name="whatsappNumberId" className="sk-input" defaultValue="">
            <option value="">Primary number</option>
            {numbers.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>
      )}

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

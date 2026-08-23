"use client";

import { useActionState, useState } from "react";
import { createTemplate } from "./actions";

const LANGUAGES = [
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "en", label: "English" },
];

export function NewTemplateForm() {
  const [state, formAction, pending] = useActionState(createTemplate, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">
        + New template
      </button>
    );
  }

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sk-label">Internal name</label>
          <input name="name" className="sk-input" placeholder="Launch DM — Hindi" required />
        </div>
        <div>
          <label className="sk-label">Language</label>
          <select name="language" className="sk-input" required defaultValue="">
            <option value="" disabled>Select…</option>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sk-label">Meta template name (exact)</label>
          <input name="metaTemplateName" className="sk-input font-mono text-sm" placeholder="instastarz_launch_hi" required />
        </div>
        <div>
          <label className="sk-label">Category</label>
          <select name="category" className="sk-input" defaultValue="MARKETING">
            <option value="MARKETING">Marketing</option>
            <option value="UTILITY">Utility</option>
            <option value="AUTHENTICATION">Authentication</option>
          </select>
        </div>
      </div>
      <div>
        <label className="sk-label">Body preview (for your own reference, not sent to Meta)</label>
        <textarea name="bodyPreview" className="sk-input" rows={3} />
      </div>
      <div>
        <label className="sk-label">Meta approval status</label>
        <select name="status" className="sk-input w-40" defaultValue="pending">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Save template"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

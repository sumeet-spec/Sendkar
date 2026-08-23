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

export function NewTemplateForm({ canSubmitToMeta }: { canSubmitToMeta: boolean }) {
  const [state, formAction, pending] = useActionState(createTemplate, null);
  const [open, setOpen] = useState(false);
  const [headerType, setHeaderType] = useState("none");

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="sk-btn sk-btn-primary">
        + New template
      </button>
    );
  }

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-5">
      <p className="text-[12.5px] text-muted">
        {canSubmitToMeta
          ? "This submits directly to Meta for review — the same request Business Manager makes, just from here."
          : "No WhatsApp Business Account connected yet, so this saves as a draft only. Connect one in Settings → Channels to submit for real review."}
      </p>
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
          <label className="sk-label">Meta template name (lowercase, underscores)</label>
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
        <label className="sk-label">Header</label>
        <div className="flex gap-2">
          <select name="headerType" className="sk-input w-40" value={headerType} onChange={(e) => setHeaderType(e.target.value)}>
            <option value="none">None</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
          </select>
          {headerType === "text" && (
            <input name="headerText" className="sk-input flex-1" placeholder="Header text" />
          )}
        </div>
      </div>

      <div>
        <label className="sk-label">Body — use {"{{1}}"} for the recipient&apos;s name</label>
        <textarea name="bodyText" className="sk-input" rows={4} placeholder={"Hi {{1}}, we've launched on WhatsApp..."} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="sk-label">Footer (optional)</label>
          <input name="footerText" className="sk-input" placeholder="Reply STOP to unsubscribe" />
        </div>
        <div>
          <label className="sk-label">Quick-reply buttons (comma-separated, up to 3)</label>
          <input name="quickReplies" className="sk-input" placeholder="Yes, No" />
        </div>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.warning && <p className="text-sm text-warn">{state.warning}</p>}

      <div className="mt-1 flex gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Submitting…" : canSubmitToMeta ? "Submit to Meta" : "Save draft"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="sk-btn sk-btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { importContacts } from "./actions";

const LANGUAGES = [
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "en", label: "English" },
];

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importContacts, null);

  return (
    <form action={formAction} className="sk-card flex items-end gap-3 p-4">
      <div className="flex-1">
        <label className="sk-label">CSV file (phone,email,tags — tags is optional, semicolon-separated)</label>
        <input type="file" name="file" accept=".csv" required className="sk-input text-sm" />
      </div>
      <div>
        <label className="sk-label">Language</label>
        <select name="language" required className="sk-input text-sm" defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
        {pending ? "Importing…" : "Import"}
      </button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-accent">
          {state.imported} new contact{state.imported === 1 ? "" : "s"}
          {state.updated > 0 ? `, ${state.updated} updated` : ""}.
        </p>
      )}
    </form>
  );
}

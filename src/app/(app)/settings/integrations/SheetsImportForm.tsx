"use client";

import { useActionState } from "react";
import { importContactsFromSheetUrl } from "./actions";

const LANGUAGES = [
  { value: "hi", label: "Hindi" }, { value: "mr", label: "Marathi" }, { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" }, { value: "kn", label: "Kannada" }, { value: "en", label: "English" },
];

export function SheetsImportForm() {
  const [state, formAction, pending] = useActionState(importContactsFromSheetUrl, null);

  return (
    <form action={formAction} className="sk-card p-4">
      <div className="mb-1 font-medium">Google Sheets</div>
      <p className="mb-3 text-[12.5px] text-faint">
        File → Share → Publish to web → CSV, then paste the link here. Same phone,email format as a CSV upload.
      </p>
      <div className="flex gap-2">
        <input name="sheetUrl" className="sk-input flex-1 text-sm" placeholder="https://docs.google.com/.../pub?output=csv" required />
        <select name="language" className="sk-input w-32 text-sm" required defaultValue="">
          <option value="" disabled>Language</option>
          {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Importing…" : "Import"}
        </button>
      </div>
      {state?.error && <p className="mt-2 text-[12.5px] text-danger">{state.error}</p>}
      {state?.success && <p className="mt-2 text-[12.5px] text-accent">Imported {state.imported} contacts.</p>}
    </form>
  );
}

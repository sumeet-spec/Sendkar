"use client";

import { useActionState } from "react";
import { importReceivables, type ImportResult } from "./actions";
import type { RemindersUi } from "@/lib/i18n/remindersCopy";

const LANGUAGES = [
  { value: "gu", label: "Gujarati" },
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "en", label: "English" },
];

export function ImportForm({ t }: { t: RemindersUi }) {
  const [state, formAction, pending] = useActionState<ImportResult | null, FormData>(importReceivables, null);

  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-4">
      <div>
        <label className="sk-label">{t.pasteLabel}</label>
        <textarea
          name="pasted"
          rows={6}
          className="sk-input font-mono text-[12.5px]"
          placeholder={"Party name\tMobile\tOutstanding\tDue date\tBill no\nPatel Textiles\t98250 12345\t1,25,000\t05/11/2026\tINV-88"}
        />
        <p className="mt-1 text-[12px] text-faint">{t.pasteHelp}</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label className="sk-label">{t.uploadLabel}</label>
          <input type="file" name="file" accept=".csv,.txt,.tsv" className="sk-input text-sm" />
        </div>
        <div>
          <label className="sk-label">{t.langLabel}</label>
          <select name="language" required defaultValue="" className="sk-input text-sm">
            <option value="" disabled>{t.select}</option>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>
      <label className="flex items-start gap-2 text-[13px]">
        <input type="checkbox" name="consent" className="mt-0.5" />
        <span>{t.consent}</span>
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? t.importing : t.importBtn}
        </button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        {state?.success && (
          <p className="text-sm text-accent">
            {t.added.replace("{n}", String(state.imported ?? 0))}
            {state.duplicates ? t.skippedDup.replace("{n}", String(state.duplicates)) : ""}
            {state.optedOut ? t.skippedOpted.replace("{n}", String(state.optedOut)) : ""}.
          </p>
        )}
      </div>
      {state?.problems && state.problems.length > 0 && (
        <ul className="list-disc pl-5 text-[12.5px] text-faint">
          {state.problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { importContacts } from "./actions";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import type { ContactsUi } from "@/lib/i18n/contactsCopy";

export function ImportForm({ t }: { t: ContactsUi }) {
  const [state, formAction, pending] = useActionState(importContacts, null);

  return (
    <form action={formAction} className="sk-card flex items-end gap-3 p-4">
      <div className="flex-1">
        <label className="sk-label">{t.csvLabel}</label>
        <input type="file" name="file" accept=".csv" required className="sk-input text-sm" />
      </div>
      <div>
        <label className="sk-label">{t.language}</label>
        <select name="language" required className="sk-input text-sm" defaultValue="">
          <option value="" disabled>
            {t.select}
          </option>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
        {pending ? t.importing : t.importBtn}
      </button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-accent">
          {t.imported.replace("{n}", String(state.imported))}
          {state.updated > 0 ? t.updated.replace("{u}", String(state.updated)) : ""}.
        </p>
      )}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import type { BillUi } from "@/lib/i18n/billUi";
import type { BillImportUi } from "@/lib/i18n/billImportUi";
import { importSalesBills, type SalesImportResult } from "./actions";

export function SalesImport({ t, ti, defaultLang }: { t: BillUi; ti: BillImportUi; defaultLang: LanguageCode }) {
  const [state, formAction, pending] = useActionState<SalesImportResult | null, FormData>(importSalesBills, null);
  const n = (s: string, v: number) => s.replace("{n}", String(v));

  return (
    <details className="sk-card mb-8 max-w-xl p-4">
      <summary className="cursor-pointer text-[14px] font-medium">{ti.title}</summary>
      <form action={formAction} className="mt-3 flex flex-col gap-3">
        <p className="text-[12.5px] text-faint">{ti.hint}</p>
        <textarea name="pasted" rows={6} required className="sk-input font-mono text-[12.5px]" placeholder={"Date\tParticulars\tVch No.\tDebit Amount\n29-Oct-26\tPatel Textiles\t1042\t12,500.00"} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="sk-label" htmlFor="imp-lang">{t.billLanguage}</label>
            <select id="imp-lang" name="lang" defaultValue={defaultLang} className="sk-input text-[15px]">
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="sk-label" htmlFor="imp-paid">&nbsp;</label>
            <select id="imp-paid" name="paid" defaultValue="paid" className="sk-input text-[15px]">
              <option value="paid">{t.paidNow}</option>
              <option value="later">{t.payLater}</option>
            </select>
          </div>
        </div>
        {state?.error && <p className="text-[13px] text-danger">{state.error}</p>}
        {state && !state.error && (
          <div className="flex flex-col gap-1 text-[13px]">
            <p className="text-accent">{n(ti.resultSent, state.sent ?? 0)}</p>
            {!!state.old && <p className="text-muted">{n(ti.resultOld, state.old)}</p>}
            {!!state.already && <p className="text-muted">{n(ti.resultAlready, state.already)}</p>}
            {!!state.noNumber?.length && <p className="text-muted">{ti.resultNoNumber} {state.noNumber.join(", ")}</p>}
            {!!state.failed?.length && <div className="text-danger"><p>{n(ti.resultFailed, state.failed.length)}</p><ul className="list-disc pl-5">{state.failed.map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
          </div>
        )}
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary self-start disabled:opacity-60">{pending ? ti.working : ti.button}</button>
      </form>
    </details>
  );
}

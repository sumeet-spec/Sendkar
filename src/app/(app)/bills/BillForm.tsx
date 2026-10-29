"use client";

import { useActionState, useMemo, useState } from "react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import type { BillUi } from "@/lib/i18n/billUi";
import { makeBill, type BillFormResult } from "./actions";

type Row = { name: string; qty: string; rate: string };
const blank = (): Row => ({ name: "", qty: "", rate: "" });

export function BillForm({ t, defaultLang, canSend }: { t: BillUi; defaultLang: LanguageCode; canSend: boolean }) {
  const [state, formAction, pending] = useActionState<BillFormResult | null, FormData>(makeBill, null);
  const [showItems, setShowItems] = useState(false);
  const [rows, setRows] = useState<Row[]>([blank()]);
  const [amount, setAmount] = useState("");
  const [later, setLater] = useState(false);

  // With rates typed, the total follows them until the shopkeeper types an amount of their own.
  const suggested = useMemo(() => {
    const sum = rows.reduce((s, r) => s + (Number(r.rate) > 0 ? Number(r.rate) * (Number(r.qty) > 0 ? Number(r.qty) : 1) : 0), 0);
    return sum > 0 ? String(Math.round(sum * 100) / 100) : "";
  }, [rows]);

  const setRow = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const tomorrow = new Date(Date.now() + 7 * 86400000 + 5.5 * 3600000).toISOString().slice(0, 10);

  if (state?.success) {
    return (
      <div className="sk-card flex flex-col gap-3 p-5">
        <p className={`text-[15px] font-medium ${state.sent ? "text-accent" : ""}`}>
          {(state.sent ? t.sentOk : t.savedNotSent).replace("{no}", state.billNo ?? "")}
        </p>
        {!state.sent && state.notice && <p className="text-[13px] text-muted">{state.notice}</p>}
        <button type="button" className="sk-btn self-start" onClick={() => window.location.reload()}>
          {t.makeAnother}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="sk-card flex max-w-xl flex-col gap-4 p-4 sm:p-5">
      <div>
        <label className="sk-label" htmlFor="bill-phone">{t.phone}</label>
        <input id="bill-phone" name="phone" type="tel" inputMode="numeric" autoComplete="off" required placeholder={t.phoneHint} className="sk-input text-[16px]" />
      </div>
      <div>
        <label className="sk-label" htmlFor="bill-name">{t.name} <span className="text-faint">({t.optional})</span></label>
        <input id="bill-name" name="name" maxLength={60} autoComplete="off" className="sk-input text-[16px]" />
      </div>

      <div>
        <label className="sk-label" htmlFor="bill-amount">{t.amount}</label>
        <input
          id="bill-amount" name="amount" type="text" inputMode="decimal" autoComplete="off"
          value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={suggested || "1500"}
          className="sk-input text-[20px] font-semibold"
        />
        {!amount && suggested && <p className="mt-1 text-[12px] text-faint">= ₹{suggested}</p>}
      </div>

      {!showItems ? (
        <button type="button" onClick={() => setShowItems(true)} className="self-start text-[13px] text-accent hover:text-accent-hover">{t.addItems}</button>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_64px_88px] gap-2">
              <input value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder={t.itemName} maxLength={80} className="sk-input text-[15px]" />
              <input value={r.qty} onChange={(e) => setRow(i, { qty: e.target.value })} placeholder={t.qty} inputMode="decimal" className="sk-input text-[15px]" />
              <input value={r.rate} onChange={(e) => setRow(i, { rate: e.target.value })} placeholder={t.rate} inputMode="decimal" className="sk-input text-[15px]" />
            </div>
          ))}
          {rows.length < 14 && (
            <button type="button" onClick={() => setRows((rs) => [...rs, blank()])} className="self-start text-[13px] text-accent hover:text-accent-hover">{t.addAnother}</button>
          )}
        </div>
      )}
      <input type="hidden" name="items" value={JSON.stringify(showItems ? rows.filter((r) => r.name.trim()) : [])} />

      <div className="grid grid-cols-2 gap-2">
        <label className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-[14px] ${!later ? "border-accent text-accent" : "border-border text-muted"}`}>
          <input type="radio" name="paid" value="paid" checked={!later} onChange={() => setLater(false)} className="sr-only" />{t.paidNow}
        </label>
        <label className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-[14px] ${later ? "border-accent text-accent" : "border-border text-muted"}`}>
          <input type="radio" name="paid" value="later" checked={later} onChange={() => setLater(true)} className="sr-only" />{t.payLater}
        </label>
      </div>
      {later && (
        <div>
          <label className="sk-label" htmlFor="bill-due">{t.dueOn}</label>
          <input id="bill-due" name="dueDate" type="date" required defaultValue={tomorrow} className="sk-input text-[16px]" />
          <p className="mt-1 text-[12px] text-faint">{t.unpaidNote}</p>
        </div>
      )}

      <div>
        <label className="sk-label" htmlFor="bill-lang">{t.billLanguage}</label>
        <select id="bill-lang" name="lang" defaultValue={defaultLang} className="sk-input text-[15px]">
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>

      <label className="flex items-start gap-2 text-[13px]">
        <input type="checkbox" name="offersOk" className="mt-0.5 h-4 w-4" />
        <span>{t.offersOk}<span className="mt-0.5 block text-[12px] text-faint">{t.offersNote}</span></span>
      </label>

      {state?.error && <p className="text-[13px] text-danger">{state.error}</p>}
      {!canSend && <p className="text-[12.5px] text-muted">{t.needNumber}</p>}
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary py-3 text-[15px] disabled:opacity-60">
        {pending ? t.sending : t.send}
      </button>
    </form>
  );
}

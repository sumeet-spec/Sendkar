"use client";

import { useActionState, useRef, useEffect, useState, useTransition } from "react";
import type { CareUi } from "@/lib/i18n/careUi";
import { addNote, completeTask, saveCustomerDetails, type CareResult } from "../actions";

export function DetailsForm({ t, contactId, birthday, anniversary, creditLimit }: { t: CareUi; contactId: string; birthday: string; anniversary: string; creditLimit: string }) {
  const [state, formAction, pending] = useActionState<CareResult | null, FormData>(saveCustomerDetails, null);
  return (
    <form action={formAction} className="sk-card flex flex-col gap-3 p-4">
      <input type="hidden" name="contactId" value={contactId} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="sk-label" htmlFor="cd-birthday">{t.birthday}</label>
          <input id="cd-birthday" name="birthday" type="date" defaultValue={birthday} className="sk-input text-[15px]" />
        </div>
        <div>
          <label className="sk-label" htmlFor="cd-anniv">{t.anniversary}</label>
          <input id="cd-anniv" name="anniversary" type="date" defaultValue={anniversary} className="sk-input text-[15px]" />
        </div>
        <div>
          <label className="sk-label" htmlFor="cd-limit">{t.creditLimit}</label>
          <input id="cd-limit" name="creditLimit" inputMode="decimal" defaultValue={creditLimit} placeholder={t.noLimit} className="sk-input text-[15px]" autoComplete="off" />
        </div>
      </div>
      <p className="text-[12px] text-faint">{t.birthdayHint} {t.creditHint}</p>
      {state?.error && <p className="text-[13px] text-danger">{state.error}</p>}
      {state?.success && <p className="text-[13px] text-accent">{t.saved}</p>}
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary self-start disabled:opacity-60">{pending ? t.saving : t.save}</button>
    </form>
  );
}

export function NoteForm({ t, contactId }: { t: CareUi; contactId: string }) {
  const [state, formAction, pending] = useActionState<CareResult | null, FormData>(addNote, null);
  const [kind, setKind] = useState<"note" | "task">("note");
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.success) ref.current?.reset(); }, [state]);
  const tomorrow = new Date(Date.now() + 86400000 + 5.5 * 3600000).toISOString().slice(0, 10);
  return (
    <form ref={ref} action={formAction} className="sk-card mb-3 flex flex-col gap-3 p-4">
      <input type="hidden" name="contactId" value={contactId} />
      <input type="hidden" name="kind" value={kind} />
      <div className="grid grid-cols-2 gap-2">
        {(["note", "task"] as const).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} className={`rounded-lg border px-3 py-2 text-[13.5px] ${kind === k ? "border-accent text-accent" : "border-border text-muted"}`}>
            {k === "note" ? t.addNote : t.followUp}
          </button>
        ))}
      </div>
      <input name="body" required maxLength={300} placeholder={kind === "note" ? t.notePlaceholder : t.followUpPlaceholder} className="sk-input text-[15px]" autoComplete="off" />
      {kind === "task" && (
        <div>
          <label className="sk-label" htmlFor="nt-due">{t.dueOn}</label>
          <input id="nt-due" name="dueDate" type="date" defaultValue={tomorrow} required className="sk-input text-[15px]" />
        </div>
      )}
      {state?.error && <p className="text-[13px] text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary self-start disabled:opacity-60">{kind === "note" ? t.addNote : t.addFollowUp}</button>
    </form>
  );
}

export function DoneButton({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(() => completeTask(id))} className="text-[12.5px] text-accent hover:text-accent-hover disabled:opacity-50">
      {label}
    </button>
  );
}

"use client";

import { useActionState, useState } from "react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import type { FollowUi } from "@/lib/i18n/followUi";
import { draftFollowup, saveFollowup, type FollowupDraft, type FollowupSaveResult } from "./followupActions";

export interface FollowupRow { id: string; language: string; body: string; status: string }

export function FollowUps({ t, defaultLang, rows }: { t: FollowUi; defaultLang: LanguageCode; rows: FollowupRow[] }) {
  const [draftState, draftAction, drafting] = useActionState<FollowupDraft | null, FormData>(draftFollowup, null);
  const [saveState, saveAction, saving] = useActionState<FollowupSaveResult | null, FormData>(saveFollowup, null);
  const [lang, setLang] = useState<LanguageCode>(defaultLang);
  const [when, setWhen] = useState("week1");
  const [edited, setEdited] = useState<string | null>(null);
  const body = edited ?? draftState?.draft ?? "";

  const whens = [["day1", t.day1], ["week1", t.week1], ["week6", t.week6], ["month3", t.month3]] as const;
  const status = (s: string) => (s === "approved" ? [t.approved, "text-accent"] : s === "rejected" ? [t.rejected, "text-danger"] : [t.waiting, "text-muted"]);

  return (
    <details className="sk-card mb-8 max-w-xl p-4">
      <summary className="cursor-pointer text-[14px] font-medium">{t.title}</summary>
      <p className="mt-3 text-[12.5px] text-faint">{t.intro}</p>

      <form action={draftAction} onSubmit={() => setEdited(null)} className="mt-3 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="sk-label" htmlFor="fu-when">{t.when}</label>
            <select id="fu-when" name="when" value={when} onChange={(e) => setWhen(e.target.value)} className="sk-input text-[15px]">
              {whens.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="sk-label" htmlFor="fu-lang">{t.lang}</label>
            <select id="fu-lang" name="lang" value={lang} onChange={(e) => setLang(e.target.value as LanguageCode)} className="sk-input text-[15px]">
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="sk-label" htmlFor="fu-goal">{t.goal}</label>
          <textarea id="fu-goal" name="goal" rows={2} required maxLength={300} placeholder={t.goalPlaceholder} className="sk-input text-[15px]" />
        </div>
        {draftState?.error && <p className="text-[13px] text-danger">{draftState.error}</p>}
        <button type="submit" disabled={drafting} className="sk-btn self-start disabled:opacity-60">{drafting ? t.writing : t.write}</button>
      </form>

      {body && (
        <form action={saveAction} className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
          <input type="hidden" name="lang" value={lang} />
          <input type="hidden" name="when" value={when} />
          <div>
            <label className="sk-label" htmlFor="fu-body">{t.draft}</label>
            <textarea id="fu-body" name="body" rows={5} value={body} onChange={(e) => setEdited(e.target.value)} className="sk-input text-[15px]" />
            <p className="mt-1 text-[12px] text-faint">{t.draftHint}</p>
          </div>
          {saveState?.error && <p className="text-[13px] text-danger">{saveState.error}</p>}
          {saveState?.ok && <p className="text-[13px] text-accent">{t.saved}</p>}
          <button type="submit" disabled={saving} className="sk-btn sk-btn-primary self-start disabled:opacity-60">{saving ? t.submitting : t.submit}</button>
          <p className="text-[12px] text-faint">{t.offersNote}</p>
        </form>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <div className="mb-1 text-[13px] font-medium">{t.yours}</div>
        {rows.length === 0 ? <p className="text-[12.5px] text-faint">{t.none}</p> : rows.map((r) => {
          const [label, cls] = status(r.status);
          return (
            <div key={r.id} className="border-t border-border py-2 text-[12.5px] first:border-t-0">
              <span className={`sk-pill ${cls}`}>{label}</span>
              <p className="mt-1 text-muted">{r.body}</p>
            </div>
          );
        })}
      </div>
    </details>
  );
}

"use client";

import { useState, useTransition } from "react";
import { PACK_LANGUAGES, PACK_TEMPLATES, type PackStage } from "@/lib/templatePack";
import { installStarterPack, type StarterPackResult } from "./actions";
import type { TemplatesUi } from "@/lib/i18n/templatesCopy";


export function StarterPack({ canSubmitToMeta, installedCount, t: tt }: { canSubmitToMeta: boolean; installedCount: number; t: TemplatesUi }) {
  const t = tt.pack;
  const STAGES: Array<{ stage: PackStage; title: string; blurb: string }> = [
    { stage: "campaign", title: t.campaignTitle, blurb: t.campaignBlurb },
    { stage: "transactional", title: t.transTitle, blurb: t.transBlurb },
    { stage: "nurture", title: t.nurtureTitle, blurb: t.nurtureBlurb },
  ];
  const [languages, setLanguages] = useState<string[]>(["hi", "gu", "en"]);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<StarterPackResult | null>(null);

  const total = PACK_TEMPLATES.length * languages.length;

  function toggle(code: string) {
    setResult(null);
    setLanguages((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  function install() {
    setResult(null);
    startTransition(async () => setResult(await installStarterPack(languages)));
  }

  return (
    <details className="sk-card mb-6 p-4" open={installedCount === 0}>
      <summary className="cursor-pointer list-none">
        <div className="font-medium">{t.title}</div>
        <p className="mt-0.5 text-[12.5px] text-muted">
          {t.blurb.replace("{n}", String(PACK_TEMPLATES.length))}
        </p>
      </summary>

      <div className="mt-4 flex flex-col gap-4">
        {STAGES.map(({ stage, title, blurb }) => (
          <div key={stage}>
            <div className="text-[13px] font-semibold">{title}</div>
            <div className="mb-1.5 text-[12px] text-faint">{blurb}</div>
            <ul className="flex flex-col gap-1">
              {PACK_TEMPLATES.filter((x) => x.stage === stage).map((x) => (
                <li key={x.key} className="flex items-start justify-between gap-3 text-[12.5px]">
                  <span><span className="font-medium">{x.title}</span> <span className="text-faint">— {x.when}</span></span>
                  <span className={`sk-pill flex-shrink-0 ${x.category === "UTILITY" ? "border-accent text-accent" : "text-muted"}`}>
                    {x.category === "UTILITY" ? t.service : t.promo}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3">
          <div className="flex items-center gap-3 text-[13px]">
            {PACK_LANGUAGES.map((l) => (
              <label key={l.code} className="flex items-center gap-1.5">
                <input type="checkbox" checked={languages.includes(l.code)} onChange={() => toggle(l.code)} /> {l.label}
              </label>
            ))}
          </div>
          <button type="button" onClick={install} disabled={pending || languages.length === 0} className="sk-btn sk-btn-primary disabled:opacity-60">
            {pending ? t.submitting : t.add.replace("{n}", String(total))}
          </button>
        </div>

        <p className="text-[12px] text-faint">
          {canSubmitToMeta ? t.noteConnected : t.noteNot}{" "}
          {t.draftNote}
        </p>

        {result?.error && <p className="text-[12.5px] text-danger">{result.error}</p>}
        {result && !result.error && (
          <div className="text-[12.5px]">
            <p className="text-accent">
              {result.submitted ? `${t.submitted.replace("{n}", String(result.submitted))} ` : ""}
              {result.savedAsDrafts ? `${t.drafts.replace("{n}", String(result.savedAsDrafts))} ` : ""}
              {result.alreadyThere ? `${t.already.replace("{n}", String(result.alreadyThere))} ` : ""}
              {result.rejected ? t.rejectedN.replace("{n}", String(result.rejected)) : ""}
            </p>
            {result.problems && result.problems.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-danger">{result.problems.map((p) => <li key={p}>{p}</li>)}</ul>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

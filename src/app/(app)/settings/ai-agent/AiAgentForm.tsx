"use client";

import { useActionState, useState } from "react";
import { saveAiAgent } from "./actions";
import type { AiAgentUi } from "@/lib/i18n/settingsCopy";

const MAX_KNOWLEDGE = 4000;

export function AiAgentForm({
  t,
  initialEnabled,
  initialKnowledge,
  planAllowed,
}: {
  t: AiAgentUi;
  initialEnabled: boolean;
  initialKnowledge: string;
  planAllowed: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveAiAgent, null);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [knowledge, setKnowledge] = useState(initialKnowledge);
  const charsLeft = MAX_KNOWLEDGE - knowledge.length;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {!planAllowed && (
        <div className="rounded-lg border border-warn/30 bg-warn/5 p-3 text-[12.5px] text-foreground">
          {t.planNote1}<a href="/settings/billing" className="text-accent hover:underline">{t.planLink}</a>{t.planNote2}
        </div>
      )}

      {/* Toggle row */}
      <div className="sk-card flex items-center justify-between p-4">
        <div className="pr-4">
          <div className="font-medium">{t.toggleTitle}</div>
          <p className="mt-0.5 text-[12.5px] text-faint">
            {t.toggleBody}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={!planAllowed}
          onClick={() => setEnabled((v) => !v)}
          className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:pointer-events-none disabled:opacity-40 ${
            enabled ? "bg-accent" : "bg-border"
          }`}
        >
          <span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ left: enabled ? "22px" : "2px" }}
          />
        </button>
        <input type="hidden" name="enabled" value={enabled ? "on" : ""} />
      </div>

      {/* Knowledge base */}
      <div className="sk-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="font-medium" htmlFor="knowledge">{t.knowTitle}</label>
          <span className={`text-[11.5px] ${charsLeft < 200 ? "text-warn" : "text-faint"}`}>
            {t.charsLeft.replace("{n}", charsLeft.toLocaleString())}
          </span>
        </div>
        <p className="mb-2 text-[12px] text-faint">
          {t.knowHelp}
        </p>
        <textarea
          id="knowledge"
          name="knowledge"
          rows={10}
          value={knowledge}
          onChange={(e) => setKnowledge(e.target.value.slice(0, MAX_KNOWLEDGE))}
          disabled={!planAllowed}
          placeholder={t.knowPh}
          className="sk-input font-mono text-[12.5px] leading-relaxed disabled:opacity-50"
        />
        <p className="mt-1 text-[11px] text-faint">
          {t.tip}
        </p>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-accent">{t.saved}</p>}

      <div className="flex">
        <button type="submit" disabled={pending || !planAllowed} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? t.saving : t.save}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { PACK_LANGUAGES, PACK_TEMPLATES, type PackStage } from "@/lib/templatePack";
import { installStarterPack, type StarterPackResult } from "./actions";

const STAGES: Array<{ stage: PackStage; title: string; blurb: string }> = [
  { stage: "campaign", title: "Festival and offer campaigns", blurb: "Send to all your customers at once." },
  { stage: "transactional", title: "After a sale and for payments", blurb: "Bills, thank-yous, LR numbers and payment reminders." },
  { stage: "nurture", title: "Keeping customers close", blurb: "Tips, birthdays and win-backs." },
];

export function StarterPack({ canSubmitToMeta, installedCount }: { canSubmitToMeta: boolean; installedCount: number }) {
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
        <div className="font-medium">Starter pack for Indian traders</div>
        <p className="mt-0.5 text-[12.5px] text-muted">
          {PACK_TEMPLATES.length} ready-made messages — festival greetings and offers, dealer rates, new stock, thank-you,
          payment reminders, LR updates — in Hindi, Gujarati and English. Add them in one click instead of writing each.
        </p>
      </summary>

      <div className="mt-4 flex flex-col gap-4">
        {STAGES.map(({ stage, title, blurb }) => (
          <div key={stage}>
            <div className="text-[13px] font-semibold">{title}</div>
            <div className="mb-1.5 text-[12px] text-faint">{blurb}</div>
            <ul className="flex flex-col gap-1">
              {PACK_TEMPLATES.filter((t) => t.stage === stage).map((t) => (
                <li key={t.key} className="flex items-start justify-between gap-3 text-[12.5px]">
                  <span><span className="font-medium">{t.title}</span> <span className="text-faint">— {t.when}</span></span>
                  <span className={`sk-pill flex-shrink-0 ${t.category === "UTILITY" ? "border-accent text-accent" : "text-muted"}`}>
                    {t.category === "UTILITY" ? "Service" : "Promotional"}
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
            {pending ? "Submitting to Meta…" : `Add ${total} templates`}
          </button>
        </div>

        <p className="text-[12px] text-faint">
          {canSubmitToMeta
            ? "Meta reviews each one on your own account: service messages are usually approved within minutes, promotional ones within hours. Anything Meta rejects shows below with its reason."
            : "Connect WhatsApp in Settings → Channels first to send these to Meta. Until then they are saved as drafts."}{" "}
          The Hindi and Gujarati wording is a first draft — have someone fluent read it before your first campaign.
        </p>

        {result?.error && <p className="text-[12.5px] text-danger">{result.error}</p>}
        {result && !result.error && (
          <div className="text-[12.5px]">
            <p className="text-accent">
              {result.submitted ? `${result.submitted} sent to Meta for review. ` : ""}
              {result.savedAsDrafts ? `${result.savedAsDrafts} saved as drafts. ` : ""}
              {result.alreadyThere ? `${result.alreadyThere} were already in your account. ` : ""}
              {result.rejected ? `${result.rejected} were rejected.` : ""}
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

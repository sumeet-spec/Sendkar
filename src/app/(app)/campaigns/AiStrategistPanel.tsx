"use client";

import { useState, useTransition } from "react";
import { generateCampaignStrategy } from "./actions";
import { createSegmentFromConditions } from "@/app/(app)/segments/actions";
import type { CampaignStrategyDraft } from "@/lib/ai";
import { SEGMENT_FIELD_LABELS } from "@/lib/segments";

export function AiStrategistPanel() {
  const [goal, setGoal] = useState("");
  const [draft, setDraft] = useState<CampaignStrategyDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [segmentSaved, setSegmentSaved] = useState(false);

  return (
    <details className="sk-card mb-5 p-4">
      <summary className="cursor-pointer text-sm font-medium">✨ AI campaign strategist</summary>
      <div className="mt-4 flex flex-col gap-3">
        <p className="text-[12.5px] text-faint">
          Describe the goal — Sendkar drafts who to target, what to say, and when, as one plan instead of three
          separate decisions.
        </p>
        <div className="flex gap-2">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="sk-input flex-1"
            placeholder="Win back customers who haven't ordered in 30 days"
          />
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                setSegmentSaved(false);
                const result = await generateCampaignStrategy(goal);
                if (result.error) setError(result.error);
                else setDraft(result.draft ?? null);
              })
            }
            className="sk-btn sk-btn-primary disabled:opacity-60"
          >
            {pending ? "Thinking…" : "Draft plan"}
          </button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}

        {draft && (
          <div className="sk-card flex flex-col gap-3 p-4">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-faint">Audience — {draft.segmentName}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {draft.segmentConditions.length === 0 && <span className="text-[12.5px] text-muted">Everyone</span>}
                {draft.segmentConditions.map((c, i) => (
                  <span key={i} className="sk-pill">{SEGMENT_FIELD_LABELS[c.field]}: {c.value}</span>
                ))}
              </div>
              {draft.segmentConditions.length > 0 && (
                <button
                  disabled={pending || segmentSaved}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await createSegmentFromConditions(draft.segmentName, draft.segmentConditions);
                      if (!result.error) setSegmentSaved(true);
                    })
                  }
                  className="mt-2 text-[12.5px] text-accent hover:text-accent-hover disabled:opacity-60"
                >
                  {segmentSaved ? "Segment saved ✓" : "Save this segment"}
                </button>
              )}
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-faint">Template draft</div>
              {draft.template.headerText && <p className="mt-1 text-sm font-medium">{draft.template.headerText}</p>}
              <p className="mt-1 text-sm">{draft.template.bodyText}</p>
              {draft.template.footerText && <p className="mt-1 text-[12.5px] text-faint">{draft.template.footerText}</p>}
              {draft.template.quickReplies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {draft.template.quickReplies.map((q, i) => <span key={i} className="sk-pill border-accent text-accent">{q}</span>)}
                </div>
              )}
              <p className="mt-2 text-[11.5px] text-faint">
                Copy this into <a href="/templates" className="text-accent hover:text-accent-hover">a new template</a> to submit it to Meta.
              </p>
            </div>

            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-faint">Send time</div>
              <p className="mt-1 text-sm">{draft.suggestedSendTime}</p>
            </div>

            {draft.rationale && <p className="border-t border-border pt-2 text-[12px] text-faint">{draft.rationale}</p>}
          </div>
        )}
      </div>
    </details>
  );
}

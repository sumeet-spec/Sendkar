"use client";

import { useState, useTransition } from "react";
import { generateCampaignStrategy } from "./actions";
import { createSegmentFromConditions } from "@/app/(app)/segments/actions";
import type { CampaignStrategyDraft } from "@/lib/ai";
import { SEGMENT_FIELD_LABELS } from "@/lib/segments";

export function AiStrategistPanel() {
  const [expanded, setExpanded] = useState(false);
  const [goal, setGoal] = useState("");
  const [draft, setDraft] = useState<CampaignStrategyDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [segmentSaved, setSegmentSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyBody() {
    if (!draft?.template.bodyText) return;
    navigator.clipboard.writeText(draft.template.bodyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="sk-card mb-5 overflow-hidden">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md text-[12px]"
            style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
          >
            ✦
          </span>
          <span className="text-[13px] font-semibold">AI campaign strategist</span>
          <span className="text-[11.5px] text-faint">— describe a goal, get audience + message + timing</span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="var(--faint)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: expanded ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }}
        >
          <path d="M2.5 5L7 9.5L11.5 5" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="flex gap-2">
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !pending && goal.trim()) {
                  e.preventDefault();
                  startTransition(async () => {
                    setError(null);
                    setSegmentSaved(false);
                    setDraft(null);
                    const result = await generateCampaignStrategy(goal);
                    if (result.error) setError(result.error);
                    else setDraft(result.draft ?? null);
                  });
                }
              }}
              className="sk-input flex-1 text-sm"
              placeholder="Win back customers who haven't ordered in 30 days"
              disabled={pending}
            />
            <button
              disabled={pending || !goal.trim()}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  setSegmentSaved(false);
                  setDraft(null);
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

          {error && <p className="mt-2 text-[12.5px] text-danger">{error}</p>}

          {pending && (
            <div className="mt-3 flex items-center gap-2 text-[12px] text-faint">
              <div className="h-1 w-32 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                <div className="h-full w-1/2 animate-[sk-skeleton-pulse_1.5s_ease-in-out_infinite] rounded-full" style={{ background: "var(--accent-dim)" }} />
              </div>
              AI is planning your campaign…
            </div>
          )}

          {draft && (
            <div className="mt-3 grid grid-cols-[1fr_1fr] gap-3">
              {/* Audience */}
              <div className="rounded-lg border border-border p-3">
                <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-wide text-faint">
                  Audience — {draft.segmentName}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {draft.segmentConditions.length === 0 && (
                    <span className="text-[12.5px] text-muted">Everyone</span>
                  )}
                  {draft.segmentConditions.map((c, i) => (
                    <span key={i} className="sk-pill text-[11px]">
                      {SEGMENT_FIELD_LABELS[c.field]}: {c.value}
                    </span>
                  ))}
                </div>
                {draft.segmentConditions.length > 0 && (
                  <button
                    disabled={pending || segmentSaved}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await createSegmentFromConditions(
                          draft.segmentName,
                          draft.segmentConditions,
                        );
                        if (!result.error) setSegmentSaved(true);
                      })
                    }
                    className="mt-2 text-[12px] font-semibold text-accent hover:text-accent-hover disabled:opacity-60"
                  >
                    {segmentSaved ? "Segment saved ✓" : "Save this segment →"}
                  </button>
                )}
              </div>

              {/* Send time */}
              <div className="rounded-lg border border-border p-3">
                <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-wide text-faint">
                  Suggested send time
                </div>
                <p className="text-[13px]">{draft.suggestedSendTime}</p>
                {draft.rationale && (
                  <p className="mt-1.5 text-[11.5px] text-faint">{draft.rationale}</p>
                )}
              </div>

              {/* Template draft — full width */}
              <div className="col-span-2 rounded-lg border border-border p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="text-[10.5px] font-medium uppercase tracking-wide text-faint">
                    Template draft
                  </div>
                  <button
                    type="button"
                    onClick={copyBody}
                    className="text-[11.5px] font-semibold text-accent hover:text-accent-hover"
                  >
                    {copied ? "Copied ✓" : "Copy body text"}
                  </button>
                </div>
                {draft.template.headerText && (
                  <p className="mb-1 text-[13px] font-semibold">{draft.template.headerText}</p>
                )}
                <p className="text-[13px] leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
                  {draft.template.bodyText}
                </p>
                {draft.template.footerText && (
                  <p className="mt-1.5 text-[11.5px] text-faint">{draft.template.footerText}</p>
                )}
                {draft.template.quickReplies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {draft.template.quickReplies.map((q, i) => (
                      <span key={i} className="sk-pill border-accent text-accent text-[11px]">
                        {q}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[11.5px] text-faint">
                  Paste this into{" "}
                  <a href="/templates" className="text-accent hover:text-accent-hover">
                    Templates
                  </a>{" "}
                  to submit to Meta for approval, then come back and create a campaign with it.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

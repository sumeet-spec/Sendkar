"use client";

import { useState, useTransition } from "react";
import { getAutomationSuggestions, createAutomationFromSuggestion } from "./actions";

interface Suggestion {
  triggerKeyword: string;
  matchType: "exact" | "contains";
  replyBody: string;
  rationale: string;
}

export function SuggestAutomations() {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function fetchSuggestions() {
    setError(null);
    startTransition(async () => {
      const result = await getAutomationSuggestions();
      if (result.error) setError(result.error);
      else setSuggestions(result.suggestions ?? []);
    });
  }

  function addSuggestion(index: number, s: Suggestion) {
    startTransition(async () => {
      const result = await createAutomationFromSuggestion(s);
      if (!result.error) setAdded((prev) => new Set(prev).add(index));
    });
  }

  return (
    <div className="sk-card mb-5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium">✳ Suggest automations from your inbox</div>
        <button onClick={fetchSuggestions} disabled={pending} className="sk-btn sk-btn-ghost text-[12.5px] disabled:opacity-60">
          {pending ? "Analyzing…" : suggestions ? "Refresh" : "Analyze"}
        </button>
      </div>
      {!suggestions && !error && (
        <p className="text-[12.5px] text-faint">Scans recent inbound messages for repeated questions worth auto-replying to.</p>
      )}
      {error && <p className="text-[12.5px] text-danger">{error}</p>}
      {suggestions && suggestions.length === 0 && <p className="text-[12.5px] text-faint">Nothing repeats enough yet to suggest.</p>}
      <div className="flex flex-col gap-2">
        {suggestions?.map((s, i) => (
          <div key={i} className="rounded-md bg-surface-2 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono text-[12.5px] text-accent">{s.triggerKeyword}</span>
              {added.has(i) ? (
                <span className="text-[12px] text-accent">Added</span>
              ) : (
                <button onClick={() => addSuggestion(i, s)} disabled={pending} className="text-[12px] text-accent hover:text-accent-hover disabled:opacity-60">
                  + Add automation
                </button>
              )}
            </div>
            <p className="text-[12.5px] text-muted">{s.replyBody}</p>
            <p className="mt-1 text-[11.5px] text-faint">{s.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

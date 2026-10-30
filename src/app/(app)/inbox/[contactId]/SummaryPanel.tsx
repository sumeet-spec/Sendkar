"use client";

import { useState, useTransition } from "react";
import { summarizeConversation } from "../actions";
import type { InboxUi } from "@/lib/i18n/inboxCopy";

export function SummaryPanel({ t, contactId }: { t: InboxUi; contactId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function summarize() {
    setError(null);
    startTransition(async () => {
      const result = await summarizeConversation(contactId);
      if (result.error) setError(result.error);
      else setSummary(result.summary ?? null);
    });
  }

  return (
    <div className="sk-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wide text-faint">{t.catchUp}</div>
        <button onClick={summarize} disabled={pending} className="text-[12px] text-accent hover:text-accent-hover disabled:opacity-60">
          {pending ? t.summarizing : summary ? t.refresh : t.summarize}
        </button>
      </div>
      {summary && <p className="text-[12.5px] text-muted">{summary}</p>}
      {error && <p className="text-[12px] text-danger">{error}</p>}
      {!summary && !error && <p className="text-[12px] text-faint">{t.summaryHint}</p>}
    </div>
  );
}

"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { replyToContact, draftReplySuggestion } from "../actions";

interface CannedResponse {
  id: string;
  shortcut: string;
  body: string;
}

export function ReplyBox({
  contactId,
  sessionOpen,
  cannedResponses,
}: {
  contactId: string;
  sessionOpen: boolean;
  cannedResponses: CannedResponse[];
}) {
  const [state, formAction, pending] = useActionState(replyToContact, null);
  const [aiPending, startAiTransition] = useTransition();
  const [aiError, setAiError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  function draftWithAi() {
    setAiError(null);
    startAiTransition(async () => {
      const result = await draftReplySuggestion(contactId);
      if (result.error) {
        setAiError(result.error);
        return;
      }
      if (result.text && textRef.current) textRef.current.value = result.text;
    });
  }

  function insertCanned(id: string) {
    const canned = cannedResponses.find((c) => c.id === id);
    if (canned && textRef.current) textRef.current.value = canned.body;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-border p-4">
      <input type="hidden" name="contactId" value={contactId} />
      {!sessionOpen && (
        <p className="text-[12.5px] text-warn">
          The 24h reply window is closed — free-text replies will fail. Send a template message from Campaigns instead,
          or wait for the contact to message again.
        </p>
      )}
      <textarea
        ref={textRef}
        name="body"
        rows={2}
        placeholder="Reply — only deliverable within 24h of their last message"
        className="sk-input resize-none"
        required
      />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {aiError && <p className="text-sm text-danger">{aiError}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={draftWithAi} disabled={aiPending} className="sk-btn sk-btn-ghost disabled:opacity-60">
            {aiPending ? "Drafting…" : "✳ Draft with AI"}
          </button>
          {cannedResponses.length > 0 && (
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) insertCanned(e.target.value);
                e.target.value = "";
              }}
              className="sk-input w-auto text-[12.5px]"
            >
              <option value="" disabled>Insert canned reply…</option>
              {cannedResponses.map((c) => (
                <option key={c.id} value={c.id}>/{c.shortcut}</option>
              ))}
            </select>
          )}
        </div>
        <button type="submit" disabled={pending || !sessionOpen} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}

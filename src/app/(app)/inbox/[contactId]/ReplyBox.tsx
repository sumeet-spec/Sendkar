"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { replyToContact, draftReplySuggestion } from "../actions";

export function ReplyBox({ contactId }: { contactId: string }) {
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

  return (
    <form action={formAction} className="flex flex-col gap-2 border-t border-border p-4">
      <input type="hidden" name="contactId" value={contactId} />
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
      <div className="flex justify-between">
        <button type="button" onClick={draftWithAi} disabled={aiPending} className="sk-btn sk-btn-ghost disabled:opacity-60">
          {aiPending ? "Drafting…" : "✳ Draft with AI"}
        </button>
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}

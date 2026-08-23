"use client";

import { useActionState, useRef } from "react";
import { replyToContact } from "../actions";

export function ReplyBox({ contactId }: { contactId: string }) {
  const [state, formAction, pending] = useActionState(replyToContact, null);
  const textRef = useRef<HTMLTextAreaElement>(null);

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
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}

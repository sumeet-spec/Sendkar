"use client";

import { useActionState } from "react";
import { addContactNote } from "../actions";
import type { InboxUi } from "@/lib/i18n/inboxCopy";

interface Note {
  id: string;
  body: string;
  created_at: string;
  author_email: string | null;
}

export function NotesPanel({ t, contactId, notes }: { t: InboxUi; contactId: string; notes: Note[] }) {
  const [state, formAction, pending] = useActionState(addContactNote, null);

  return (
    <div className="sk-card flex flex-col gap-3 p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">{t.privateNotes}</div>
      <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
        {notes.map((n) => (
          <div key={n.id} className="rounded-md bg-surface-2 p-2.5 text-[12.5px]">
            <p className="text-muted">{n.body}</p>
            <p className="mt-1 text-[11px] text-faint">{n.author_email ?? t.someone} · {new Date(n.created_at).toLocaleString()}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-[12.5px] text-faint">{t.noNotes}</p>}
      </div>
      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="contactId" value={contactId} />
        <input name="body" className="sk-input flex-1 text-[12.5px]" placeholder={t.notePh} required />
        <button type="submit" disabled={pending} className="sk-btn sk-btn-ghost disabled:opacity-60">
          {pending ? "…" : t.add}
        </button>
      </form>
      {state?.error && <p className="text-[12px] text-danger">{state.error}</p>}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { addContactNote } from "../actions";

interface Note {
  id: string;
  body: string;
  created_at: string;
  author_email: string | null;
}

export function NotesPanel({ contactId, notes }: { contactId: string; notes: Note[] }) {
  const [state, formAction, pending] = useActionState(addContactNote, null);

  return (
    <div className="sk-card flex flex-col gap-3 p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">Private notes</div>
      <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
        {notes.map((n) => (
          <div key={n.id} className="rounded-md bg-surface-2 p-2.5 text-[12.5px]">
            <p className="text-muted">{n.body}</p>
            <p className="mt-1 text-[11px] text-faint">{n.author_email ?? "Someone"} · {new Date(n.created_at).toLocaleString()}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-[12.5px] text-faint">No notes yet — visible only to your team, never sent to the contact.</p>}
      </div>
      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="contactId" value={contactId} />
        <input name="body" className="sk-input flex-1 text-[12.5px]" placeholder="Add a note for your team…" required />
        <button type="submit" disabled={pending} className="sk-btn sk-btn-ghost disabled:opacity-60">
          {pending ? "…" : "Add"}
        </button>
      </form>
      {state?.error && <p className="text-[12px] text-danger">{state.error}</p>}
    </div>
  );
}

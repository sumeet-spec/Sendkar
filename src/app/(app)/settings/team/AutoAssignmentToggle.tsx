"use client";

import { useActionState } from "react";
import { toggleAutoAssignment } from "./actions";

export function AutoAssignmentToggle({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState(toggleAutoAssignment, null);

  return (
    <form action={formAction} className="sk-card p-4">
      <label className="flex items-center gap-3">
        <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-4 w-4 accent-[var(--accent)]" />
        <span className="text-sm">Auto-assign new conversations to whoever has the fewest open chats</span>
      </label>
      <p className="mt-2 text-[12.5px] text-faint">
        Load-balanced, not round-robin — a new contact always goes to the teammate with the least on their plate
        right now, not a fixed rotation.
      </p>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary mt-3 disabled:opacity-60">
        {pending ? "Saving…" : "Save"}
      </button>
      {state?.error && <p className="mt-2 text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="mt-2 text-sm text-accent">Saved.</p>}
    </form>
  );
}

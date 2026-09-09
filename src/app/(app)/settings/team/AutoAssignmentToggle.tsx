"use client";

import { useActionState, useState } from "react";
import { toggleAutoAssignment } from "./actions";

export function AutoAssignmentToggle({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState(toggleAutoAssignment, null);
  const [isEnabled, setIsEnabled] = useState(enabled);

  return (
    <form action={formAction} className="sk-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium">Auto-assign conversations</div>
          <p className="mt-1 text-[12.5px] text-faint">
            Load-balanced, not round-robin — a new contact always goes to the teammate with the least on their plate
            right now, not a fixed rotation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEnabled((v) => !v)}
          className={`relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full transition-colors ${isEnabled ? "bg-accent" : "bg-border"}`}
        >
          <span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ left: isEnabled ? "22px" : "2px" }}
          />
        </button>
      </div>
      <input type="hidden" name="enabled" value={isEnabled ? "on" : ""} />
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Save"}
        </button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        {state?.success && <p className="text-sm text-accent">Saved.</p>}
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { inviteTeamMember } from "./actions";

export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteTeamMember, null);

  return (
    <form action={formAction} className="sk-card flex items-end gap-3 p-4">
      <div className="flex-1">
        <label className="sk-label">Invite by email</label>
        <input name="email" type="email" required className="sk-input" placeholder="teammate@company.com" />
      </div>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
        {pending ? "Sending…" : "Invite"}
      </button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-accent">
          Invite created — share this link: <span className="font-mono">{state.inviteLink}</span>
        </p>
      )}
    </form>
  );
}

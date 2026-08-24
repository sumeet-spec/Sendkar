"use client";

import { useActionState } from "react";
import { toggleCalling } from "./actions";

export function CallingToggle({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState(toggleCalling, null);

  return (
    <form action={formAction} className="sk-card p-4">
      <label className="flex items-center gap-3">
        <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-4 w-4 accent-[var(--accent)]" />
        <span className="text-sm">Calling is enabled for this WABA</span>
      </label>
      <p className="mt-2 text-[12.5px] text-faint">
        Meta grants calling access per WhatsApp Business Account, manually, on their side — turning this on here
        doesn&apos;t request that from Meta, it only tells Sendkar to expect call events once Meta has actually
        granted it.
      </p>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary mt-3 disabled:opacity-60">
        {pending ? "Saving…" : "Save"}
      </button>
      {state?.error && <p className="mt-2 text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="mt-2 text-sm text-accent">Saved.</p>}
    </form>
  );
}

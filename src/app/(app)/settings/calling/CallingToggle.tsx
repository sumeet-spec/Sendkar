"use client";

import { useActionState, useState } from "react";
import { toggleCalling } from "./actions";

export function CallingToggle({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState(toggleCalling, null);
  const [isEnabled, setIsEnabled] = useState(enabled);

  return (
    <form action={formAction} className="sk-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium">Calling enabled</div>
          <p className="mt-1 text-[12.5px] text-faint">
            Meta grants calling access per WhatsApp Business Account, manually, on their side — turning this on here
            doesn&apos;t request that from Meta, it only tells Sendkar to expect call events once Meta has actually
            granted it.
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

"use client";

import { useActionState } from "react";
import { saveWhatsAppCreds, skipOnboarding } from "./actions";

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(saveWhatsAppCreds, null);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="sk-card w-full max-w-md p-8">
        <h1 className="mb-1 text-xl font-semibold">Connect WhatsApp</h1>
        <p className="mb-6 text-sm text-muted">
          From Meta Business Manager → WhatsApp → API Setup. Don&apos;t have a WhatsApp Business number yet? Skip
          this — everything else in Sendkar works, sending just stays off until this is filled in.
        </p>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label className="sk-label" htmlFor="phoneNumberId">Phone number ID</label>
            <input className="sk-input font-mono text-sm" id="phoneNumberId" name="phoneNumberId" placeholder="1029384756..." />
          </div>
          <div>
            <label className="sk-label" htmlFor="wabaId">WhatsApp Business Account ID</label>
            <input className="sk-input font-mono text-sm" id="wabaId" name="wabaId" placeholder="9876543210..." />
          </div>
          <div>
            <label className="sk-label" htmlFor="accessToken">System user access token</label>
            <input className="sk-input font-mono text-sm" id="accessToken" name="accessToken" type="password" placeholder="EAAG..." />
          </div>

          {state?.error && <p className="text-sm text-danger">{state.error}</p>}

          <div className="mt-1 flex gap-3">
            <button type="submit" disabled={pending} className="sk-btn sk-btn-primary flex-1 disabled:opacity-60">
              {pending ? "Saving…" : "Save & continue"}
            </button>
            <button type="button" onClick={() => skipOnboarding()} className="sk-btn sk-btn-ghost">
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

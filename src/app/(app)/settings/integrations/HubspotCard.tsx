"use client";

import { useActionState } from "react";

export function HubspotCard({ hasKey, action }: { hasKey: boolean; action: (prevState: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean }> }) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="sk-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-medium">HubSpot</div>
        {hasKey && <span className="sk-pill border-accent text-accent">Configured</span>}
      </div>
      <p className="mb-3 text-[12.5px] text-faint">
        Every new WhatsApp contact syncs as a HubSpot contact (matched or created by phone number). From HubSpot:
        Settings → Integrations → Private Apps → create one with contacts read/write scope.
      </p>
      <div className="flex gap-2">
        <input name="apiKey" type="password" className="sk-input flex-1 text-sm" placeholder={hasKey ? "•••••••• (set)" : "pat-..."} />
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "…" : "Save"}
        </button>
      </div>
      {state?.error && <p className="mt-2 text-[12.5px] text-danger">{state.error}</p>}
    </form>
  );
}

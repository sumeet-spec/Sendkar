"use client";

import { useActionState } from "react";

export function KlaviyoCard({ hasKey, action }: { hasKey: boolean; action: (prevState: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean }> }) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="sk-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-medium">Klaviyo</div>
        {hasKey && <span className="sk-pill border-accent text-accent">Configured</span>}
      </div>
      <p className="mb-3 text-[12.5px] text-faint">
        Every new WhatsApp contact syncs as a Klaviyo profile. From Klaviyo: Settings → API Keys → Create Private API Key.
      </p>
      <div className="flex gap-2">
        <input name="apiKey" type="password" className="sk-input flex-1 text-sm" placeholder={hasKey ? "•••••••• (set)" : "pk_..."} />
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "…" : "Save"}
        </button>
      </div>
      {state?.error && <p className="mt-2 text-[12.5px] text-danger">{state.error}</p>}
    </form>
  );
}

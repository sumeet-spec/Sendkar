"use client";

import { useActionState } from "react";
import { saveWooCommerceCreds } from "./actions";

export function WooCommerceCard({ storeUrl, hasSecret, webhookUrl }: { storeUrl: string | null; hasSecret: boolean; webhookUrl: string }) {
  const [state, formAction, pending] = useActionState(saveWooCommerceCreds, null);

  return (
    <form action={formAction} className="sk-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="font-medium">WooCommerce</div>
        {hasSecret && <span className="sk-pill border-accent text-accent">Configured</span>}
      </div>
      <p className="mb-3 text-[12.5px] text-faint">
        In WordPress: WooCommerce → Settings → Advanced → Webhooks → Add. Topic &quot;Order created&quot;, delivery URL below, set any secret and paste it here too.
      </p>
      <div className="mb-2 flex items-center gap-2">
        <code className="flex-1 truncate rounded-md bg-surface-2 px-2 py-1.5 text-[11.5px] text-accent">{webhookUrl}</code>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="storeUrl" defaultValue={storeUrl ?? ""} className="sk-input text-sm" placeholder="https://yourstore.com" />
        <input name="webhookSecret" type="password" className="sk-input text-sm" placeholder={hasSecret ? "•••••••• (set)" : "Webhook secret"} />
      </div>
      <button type="submit" disabled={pending} className="sk-btn sk-btn-primary mt-2 disabled:opacity-60">
        {pending ? "Saving…" : "Save"}
      </button>
      {state?.error && <p className="mt-2 text-[12.5px] text-danger">{state.error}</p>}
    </form>
  );
}

"use client";

import { useActionState, useState, useTransition } from "react";
import { connectShopify, disconnectShopify } from "./actions";

export function ShopifyCard({ connected, shopDomain, configured }: { connected: boolean; shopDomain: string | null; configured: boolean }) {
  const [state, formAction, pending] = useActionState(connectShopify, null);
  const [disconnectPending, startDisconnect] = useTransition();
  const [disconnectError, setDisconnectError] = useState<string | null>(null);

  if (!configured) {
    return (
      <div className="sk-card p-4">
        <div className="mb-1 font-medium">Shopify</div>
        <p className="text-[12.5px] text-faint">Not available on this deployment yet — needs a Shopify Partner app registered (SHOPIFY_API_KEY/SECRET).</p>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="sk-card p-4">
        <div className="mb-1 flex items-center justify-between">
          <div className="font-medium">Shopify</div>
          <span className="sk-pill border-accent text-accent">Connected</span>
        </div>
        <p className="mb-2 font-mono text-[12.5px] text-faint">{shopDomain}</p>
        <button
          disabled={disconnectPending}
          onClick={() =>
            startDisconnect(async () => {
              setDisconnectError(null);
              const result = await disconnectShopify();
              if (result.error) setDisconnectError(result.error);
            })
          }
          className="text-xs text-faint hover:text-danger"
        >
          Disconnect
        </button>
        {disconnectError && <p className="mt-1.5 text-[12px] text-danger">{disconnectError}</p>}
      </div>
    );
  }

  return (
    <form action={formAction} className="sk-card p-4">
      <div className="mb-2 font-medium">Shopify</div>
      <p className="mb-3 text-[12.5px] text-faint">Auto-sends an order confirmation on every new order.</p>
      <div className="flex gap-2">
        <input name="shop" className="sk-input flex-1 text-sm" placeholder="your-store.myshopify.com" />
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "…" : "Connect"}
        </button>
      </div>
      {state?.error && <p className="mt-2 text-[12.5px] text-danger">{state.error}</p>}
    </form>
  );
}

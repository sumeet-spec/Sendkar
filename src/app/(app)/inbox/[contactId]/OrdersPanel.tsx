"use client";

import { useActionState } from "react";
import { logOrder } from "../actions";

interface Order {
  id: string;
  total_amount: number;
  currency: string;
  source: string;
  order_label: string | null;
  attributed_campaign_id: string | null;
  created_at: string;
}

export function OrdersPanel({ contactId, orders }: { contactId: string; orders: Order[] }) {
  const [state, formAction, pending] = useActionState(logOrder, null);
  const total = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="sk-card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wide text-faint">Sales</div>
        {orders.length > 0 && <span className="sk-pill border-accent text-accent">₹{total.toLocaleString("en-IN")}</span>}
      </div>
      <div className="flex max-h-32 flex-col gap-2 overflow-y-auto">
        {orders.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-md bg-surface-2 p-2.5 text-[12.5px]">
            <div>
              <span className="font-medium">₹{Number(o.total_amount).toLocaleString("en-IN")}</span>
              {o.order_label && <span className="ml-1.5 text-faint">{o.order_label}</span>}
              {o.attributed_campaign_id && <div className="mt-0.5 text-[11px] text-accent">from a campaign</div>}
            </div>
            <span className="text-faint">{new Date(o.created_at).toLocaleDateString()}</span>
          </div>
        ))}
        {orders.length === 0 && <p className="text-[12.5px] text-faint">No sales logged for this contact yet.</p>}
      </div>
      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="contactId" value={contactId} />
        <div className="flex gap-2">
          <input name="amount" type="number" step="0.01" min="0" className="sk-input w-24 text-[12.5px]" placeholder="₹ amount" required />
          <input name="note" className="sk-input flex-1 text-[12.5px]" placeholder="What did they buy? (optional)" />
        </div>
        <button type="submit" disabled={pending} className="sk-btn sk-btn-ghost self-start disabled:opacity-60">
          {pending ? "…" : "Log a sale"}
        </button>
      </form>
      {state?.error && <p className="text-[12px] text-danger">{state.error}</p>}
    </div>
  );
}

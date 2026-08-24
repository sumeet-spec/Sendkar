"use client";

import { useActionState, useState } from "react";
import { createSequence } from "./actions";

export function NewSequenceForm() {
  const [state, formAction, pending] = useActionState(createSequence, null);
  const [triggerType, setTriggerType] = useState("keyword");

  return (
    <details className="sk-card p-4">
      <summary className="cursor-pointer text-sm font-medium">New sequence</summary>
      <form action={formAction} className="mt-4 flex flex-col gap-3">
        <div>
          <label className="sk-label">Name</label>
          <input name="name" required className="sk-input" placeholder="Cart recovery — Diwali" />
        </div>
        <div>
          <label className="sk-label">Trigger</label>
          <select name="triggerType" value={triggerType} onChange={(e) => setTriggerType(e.target.value)} className="sk-input">
            <option value="keyword">Keyword</option>
            <option value="cart_abandoned">Cart abandoned (Shopify)</option>
            <option value="order_placed">Order placed (Shopify)</option>
          </select>
        </div>
        {triggerType === "keyword" && (
          <div className="flex gap-2">
            <input name="triggerKeyword" required className="sk-input flex-1" placeholder="e.g. discount" />
            <select name="matchType" className="sk-input w-32">
              <option value="contains">Contains</option>
              <option value="exact">Exact</option>
            </select>
          </div>
        )}
        <button type="submit" disabled={pending} className="sk-btn sk-btn-primary self-start disabled:opacity-60">
          {pending ? "Creating…" : "Create"}
        </button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      </form>
    </details>
  );
}

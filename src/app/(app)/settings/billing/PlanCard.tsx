"use client";

import { useState } from "react";
import { startCheckout } from "./actions";

export function PlanCard({
  plan, priceInr, features, current, highlight,
}: { plan: string; priceInr: number; features: string[]; current: boolean; highlight?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setPending(true);
    setError(null);
    const result = await startCheckout(plan);
    if (result.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    if (result.url) window.location.href = result.url;
  }

  return (
    <div className={`sk-card p-5 ${highlight ? "border-accent-dim" : ""}`}>
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[15px] font-semibold capitalize">{plan}</div>
        {current && <span className="sk-pill bg-accent border-accent text-[#05130a]">Current</span>}
      </div>
      <div className="mb-4 text-2xl font-semibold">
        {priceInr === 0 ? "Free" : `₹${priceInr}`}
        {priceInr > 0 && <span className="text-sm font-normal text-faint">/mo</span>}
      </div>
      <ul className="mb-4 flex flex-col gap-1.5 text-[13px] text-muted">
        {features.map((f) => <li key={f}>· {f}</li>)}
      </ul>
      {!current && plan !== "free" && (
        <button onClick={upgrade} disabled={pending} className="sk-btn sk-btn-primary w-full disabled:opacity-60">
          {pending ? "Redirecting…" : "Upgrade"}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

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
    <div
      className={`sk-card flex flex-col p-5 transition-colors ${
        current
          ? "border-accent bg-[rgba(34,197,94,0.04)]"
          : highlight
          ? "border-accent/40"
          : ""
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[15px] font-semibold capitalize">{plan}</div>
        {current && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-[#05130a]">
            Current
          </span>
        )}
      </div>
      <div className="mb-4 text-2xl font-semibold">
        {priceInr === 0 ? "Free" : `₹${priceInr.toLocaleString("en-IN")}`}
        {priceInr > 0 && <span className="ml-0.5 text-sm font-normal text-faint">/mo</span>}
      </div>
      <ul className="mb-4 flex flex-1 flex-col gap-1.5 text-[12.5px] text-muted">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-1.5">
            <span className="mt-0.5 flex-shrink-0 text-accent">✓</span>
            {f}
          </li>
        ))}
      </ul>
      {current ? (
        <div className="mt-auto rounded-md border border-accent/30 bg-accent/5 px-3 py-1.5 text-center text-[12px] text-accent">
          Active plan
        </div>
      ) : plan !== "free" ? (
        <button onClick={upgrade} disabled={pending} className="sk-btn sk-btn-primary mt-auto w-full disabled:opacity-60">
          {pending ? "Redirecting…" : "Upgrade"}
        </button>
      ) : (
        <div className="mt-auto h-8" />
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

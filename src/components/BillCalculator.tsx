"use client";

import { useState } from "react";
import { PLAN_LIMITS } from "@/lib/plans";
import { META_INDIA_RATES_INR, estimateMonthlyMetaFees } from "@/lib/metaFees";

const rate = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
const inr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const PLAN_CHOICES = [
  { key: "free", name: "Free" },
  { key: "starter", name: "Starter" },
  { key: "growth", name: "Growth" },
  { key: "scale", name: "Scale" },
] as const;

export function BillCalculator() {
  const [marketing, setMarketing] = useState(500);
  const [utility, setUtility] = useState(300);
  const [plan, setPlan] = useState<(typeof PLAN_CHOICES)[number]["key"]>("starter");

  const fees = estimateMonthlyMetaFees(marketing, utility);
  const planPrice = PLAN_LIMITS[plan].priceInr;

  const field = "sk-input w-full text-sm";
  return (
    <div className="sk-card mx-auto mt-8 max-w-3xl p-5">
      <h3 className="mb-1 font-semibold">Estimate your monthly bill</h3>
      <p className="mb-4 text-[12.5px] text-muted">
        Your Sendkar plan is one charge. Meta bills WhatsApp message fees separately, to your own WhatsApp account.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="sk-label">Promotional messages / month</span>
          <input type="number" min={0} inputMode="numeric" className={field} value={marketing} onChange={(e) => setMarketing(Number(e.target.value))} />
          <span className="mt-1 block text-[11.5px] text-faint">Offers, new stock, price lists</span>
        </label>
        <label className="block">
          <span className="sk-label">Service messages / month</span>
          <input type="number" min={0} inputMode="numeric" className={field} value={utility} onChange={(e) => setUtility(Number(e.target.value))} />
          <span className="mt-1 block text-[11.5px] text-faint">Order updates, payment reminders</span>
        </label>
        <label className="block">
          <span className="sk-label">Sendkar plan</span>
          <select className={field} value={plan} onChange={(e) => setPlan(e.target.value as typeof plan)}>
            {PLAN_CHOICES.map((p) => <option key={p.key} value={p.key}>{p.name} — {inr(PLAN_LIMITS[p.key].priceInr)}/mo</option>)}
          </select>
        </label>
      </div>

      <dl className="mt-5 grid gap-2 text-[13.5px]">
        <div className="flex justify-between"><dt className="text-muted">Sendkar plan</dt><dd>{inr(planPrice)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Meta fees — promotional ({marketing.toLocaleString("en-IN")} × {rate(META_INDIA_RATES_INR.marketing)})</dt><dd>{inr(fees.marketing)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Meta fees — service ({utility.toLocaleString("en-IN")} × {rate(META_INDIA_RATES_INR.utility)})</dt><dd>{inr(fees.utility)}</dd></div>
        <div className="flex justify-between border-t border-border pt-2 font-semibold"><dt>Estimated total</dt><dd>{inr(planPrice + fees.total)}</dd></div>
      </dl>
      <p className="mt-3 text-[11.5px] leading-relaxed text-faint">
        Meta&apos;s India rates from {META_INDIA_RATES_INR.asOf}, per delivered message, before GST. Replies to customers
        who message you first are free for the first 1,000 per number each month. Check the current figures on{" "}
        <a href={META_INDIA_RATES_INR.source} className="text-accent hover:text-accent-hover" target="_blank" rel="noopener noreferrer">Meta&apos;s pricing page</a>.
      </p>
    </div>
  );
}

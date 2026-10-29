"use client";

import { useState } from "react";
import { META_INDIA_RATES_INR, estimateMonthlyMetaFees } from "@/lib/metaFees";
import type { SiteCopy } from "@/lib/i18n/site";

const rate = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
const inr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export interface CalculatorPlan {
  key: string;
  name: string;
  priceInr: number;
}

/** The homepage's monthly bill estimate. All wording comes from the page copy so it is in the visitor's language. */
export function BillCalculator({ copy, plans }: { copy: SiteCopy["calc"]; plans: CalculatorPlan[] }) {
  const [promo, setPromo] = useState(500);
  const [service, setService] = useState(300);
  const [planKey, setPlanKey] = useState(plans[0]?.key ?? "starter");

  const fees = estimateMonthlyMetaFees(promo, service);
  const planPrice = plans.find((p) => p.key === planKey)?.priceInr ?? 0;
  const field = "sk-input w-full text-[15px]";

  return (
    <div className="sk-site-card mx-auto max-w-3xl">
      <h3 className="text-[19px] font-semibold">{copy.title}</h3>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{copy.sub}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="sk-label">{copy.promo}</span>
          <input type="number" min={0} inputMode="numeric" className={field} value={promo} onChange={(e) => setPromo(Number(e.target.value))} />
          <span className="mt-1 block text-[12.5px] text-faint">{copy.promoHint}</span>
        </label>
        <label className="block">
          <span className="sk-label">{copy.service}</span>
          <input type="number" min={0} inputMode="numeric" className={field} value={service} onChange={(e) => setService(Number(e.target.value))} />
          <span className="mt-1 block text-[12.5px] text-faint">{copy.serviceHint}</span>
        </label>
        <label className="block">
          <span className="sk-label">{copy.plan}</span>
          <select className={field} value={planKey} onChange={(e) => setPlanKey(e.target.value)}>
            {plans.map((p) => <option key={p.key} value={p.key}>{p.name} — {inr(p.priceInr)}</option>)}
          </select>
        </label>
      </div>

      <dl className="mt-6 grid gap-2.5 text-[15px]">
        <div className="flex justify-between gap-4"><dt className="text-muted">{copy.planRow}</dt><dd>{inr(planPrice)}</dd></div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{copy.metaPromo} ({promo.toLocaleString("en-IN")} × {rate(META_INDIA_RATES_INR.marketing)})</dt>
          <dd>{inr(fees.marketing)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{copy.metaService} ({service.toLocaleString("en-IN")} × {rate(META_INDIA_RATES_INR.utility)})</dt>
          <dd>{inr(fees.utility)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-3 text-[17px] font-semibold"><dt>{copy.total}</dt><dd>{inr(planPrice + fees.total)}</dd></div>
      </dl>
      <p className="mt-4 text-[12.5px] leading-relaxed text-faint">
        {copy.footnote}{" "}
        <a href={META_INDIA_RATES_INR.source} className="text-accent hover:text-accent-hover" target="_blank" rel="noopener noreferrer">{copy.footnoteLink}</a>.
      </p>
    </div>
  );
}

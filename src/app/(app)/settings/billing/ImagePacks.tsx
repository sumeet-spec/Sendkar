"use client";

import { useState } from "react";
import { startImagePackCheckout } from "./actions";
import type { BillingUi } from "@/lib/i18n/billingCopy";

interface PackOption {
  key: string;
  images: number;
  priceInr: number;
  available: boolean;
}

export function ImagePacks({ t, packs }: { t: BillingUi; packs: PackOption[] }) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(key: string) {
    setPending(key);
    setError(null);
    const result = await startImagePackCheckout(key);
    if (result.error) {
      setError(result.error);
      setPending(null);
      return;
    }
    if (result.url) window.location.assign(result.url);
  }

  return (
    <div className="sk-card mb-6 p-4">
      <div className="text-[13px] font-semibold">{t.packsTitle}</div>
      <p className="mt-0.5 text-[12px] text-faint">{t.packsHelp}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {packs.map((p) => (
          <div key={p.key} className="rounded-lg border border-border p-3">
            <div className="text-[15px] font-semibold">{t.imagesN.replace("{n}", String(p.images))}</div>
            <div className="text-[13px] text-muted">₹{p.priceInr.toLocaleString("en-IN")} <span className="text-faint">· {t.aboutEach.replace("{n}", (p.priceInr / p.images).toFixed(0))}</span></div>
            <button
              type="button"
              onClick={() => buy(p.key)}
              disabled={!p.available || pending !== null}
              className="sk-btn sk-btn-ghost mt-2.5 w-full text-[12.5px] disabled:opacity-60"
            >
              {!p.available ? t.notAvailable : pending === p.key ? t.redirecting : t.buy}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="mt-2 text-[12.5px] text-danger">{error}</p>}
    </div>
  );
}

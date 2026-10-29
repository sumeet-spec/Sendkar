"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PACK_LANGUAGES } from "@/lib/templatePack";
import { createThankYouJourney } from "./actions";

export function JourneyCard() {
  const router = useRouter();
  const [language, setLanguage] = useState("hi");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function create() {
    setError(null);
    startTransition(async () => {
      const result = await createThankYouJourney(language);
      if (result.error) setError(result.error);
      else if (result.id) router.push(`/sequences/${result.id}`);
    });
  }

  return (
    <div className="sk-card mb-5 p-4">
      <div className="font-medium">Thank customers and stay in touch</div>
      <p className="mt-0.5 text-[12.5px] text-muted">
        Every sale you log (in the inbox, or from Shopify / WooCommerce) sends a thank-you with the bill details straight
        away, a care tip a week later, and a we-miss-you note after six weeks. Set up in one click from the Starter pack.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="sk-input w-36 text-sm">
          {PACK_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <button type="button" onClick={create} disabled={pending} className="sk-btn sk-btn-primary disabled:opacity-60">
          {pending ? "Setting up…" : "Set up this journey"}
        </button>
      </div>
      {error && <p className="mt-2 text-[12.5px] text-danger">{error}</p>}
      <p className="mt-2 text-[11.5px] text-faint">
        Only customers who agreed to hear from you should be messaged. Each promotional message costs about ₹0.86 in Meta
        fees; thank-you and bill messages cost about ₹0.12.
      </p>
    </div>
  );
}

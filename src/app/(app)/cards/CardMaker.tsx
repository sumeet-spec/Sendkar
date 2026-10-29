"use client";

import Link from "next/link";
import { useState } from "react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import { OCCASIONS, matchOccasion, type OccasionId } from "@/lib/cards/occasions";

type Made = { url: string; imagesRemaining?: number };

export function CardMaker({ workspaceId, hasLogo }: { workspaceId: string; hasLogo: boolean }) {
  const [lang, setLang] = useState<LanguageCode>("hi");
  const [occasion, setOccasion] = useState<OccasionId | "">("diwali");
  const [ask, setAsk] = useState("");
  const [custom, setCustom] = useState("");
  const [line, setLine] = useState("");
  const [withBackground, setWithBackground] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [made, setMade] = useState<Made | null>(null);

  function onAsk(text: string) {
    setAsk(text);
    const hit = matchOccasion(text);
    if (hit) { setOccasion(hit.id); setCustom(""); }
  }

  async function make() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cards/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, lang, occasion: custom.trim() ? undefined : occasion || undefined, headline: custom.trim() || undefined, line: line.trim() || undefined, withBackground }),
      });
      const json = (await res.json()) as { url?: string; error?: string; imagesRemaining?: number };
      if (!res.ok || !json.url) setError(json.error ?? "Could not make the card.");
      else setMade({ url: json.url, imagesRemaining: json.imagesRemaining });
    } catch {
      setError("Could not make the card. Check your internet and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div>
          <label className="sk-label">What card do you want? (optional)</label>
          <input value={ask} onChange={(e) => onAsk(e.target.value)} className="sk-input" placeholder="make a card for Diwali" />
        </div>

        <div>
          <label className="sk-label">Occasion</label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => { setOccasion(o.id); setCustom(""); }}
                className={`rounded-full border px-3 py-1 text-[12.5px] ${occasion === o.id && !custom ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:text-foreground"}`}
              >
                {o.label.en}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="sk-label">Or write your own heading</label>
          <input value={custom} onChange={(e) => setCustom(e.target.value)} className="sk-input" maxLength={80} lang={lang} />
        </div>

        <div>
          <label className="sk-label">Language of the card</label>
          <select value={lang} onChange={(e) => setLang(e.target.value as LanguageCode)} className="sk-input">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        <div>
          <label className="sk-label">Offer or message (optional)</label>
          <input value={line} onChange={(e) => setLine(e.target.value)} className="sk-input" maxLength={120} lang={lang} placeholder="15% off till Sunday" />
        </div>

        <label className="flex items-start gap-2 text-[13px]">
          <input type="checkbox" checked={withBackground} onChange={(e) => setWithBackground(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
          <span>
            Add a festive picture behind the words
            <span className="block text-[12px] text-faint">Uses 1 of your monthly AI pictures. The words are always written by Sendkar, so they are never wrong.</span>
          </span>
        </label>

        {!hasLogo && (
          <p className="text-[12.5px] text-faint">
            No logo yet. <Link href="/settings/brand" className="text-accent hover:text-accent-hover">Add your logo</Link> to have it on every card.
          </p>
        )}

        <div className="flex items-center gap-3">
          <button type="button" onClick={make} disabled={busy} className="sk-btn sk-btn-primary disabled:opacity-60">
            {busy ? "Making your card…" : made ? "Make it again" : "Make card"}
          </button>
        </div>
        {error && (
          <p className="text-sm text-danger">
            {error}{" "}
            {error.toLowerCase().includes("brand kit") && <Link href="/settings/brand" className="underline">Open brand kit</Link>}
            {error.toLowerCase().includes("allowance") && <Link href="/settings/billing" className="underline">See plans and packs</Link>}
          </p>
        )}
      </div>

      <div>
        <div className="sk-card flex aspect-square items-center justify-center overflow-hidden">
          {made ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={made.url} alt="Your card" className="h-full w-full object-contain" />
          ) : (
            <span className="px-6 text-center text-[13px] text-faint">Your card will appear here.</span>
          )}
        </div>
        {made && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link href={`/campaigns?card=${encodeURIComponent(made.url)}`} className="sk-btn sk-btn-primary">Send to my customers</Link>
            <a href={made.url} download target="_blank" rel="noreferrer" className="sk-btn">Download</a>
            {typeof made.imagesRemaining === "number" && <span className="text-[12px] text-faint">{made.imagesRemaining} AI pictures left this month</span>}
          </div>
        )}
      </div>
    </div>
  );
}

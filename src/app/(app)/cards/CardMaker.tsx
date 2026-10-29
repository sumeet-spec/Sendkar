"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import { OCCASIONS, matchOccasion, type OccasionId } from "@/lib/cards/occasions";
import { fillN, type AppCopy } from "@/lib/i18n/appCopy";

type Made = { url: string; imagesRemaining?: number; urls?: Partial<Record<LanguageCode, string>>; skipped?: LanguageCode[] };

const LANG_KEY = "sk_card_lang";

export function CardMaker({ workspaceId, hasLogo, defaultLang, fromCustomers, initialOccasion, customerLangs, t, uiLang }: { t: AppCopy["cards"]; uiLang: LanguageCode; workspaceId: string; hasLogo: boolean; defaultLang: LanguageCode; fromCustomers: boolean; initialOccasion: OccasionId; customerLangs: LanguageCode[] }) {
  const [lang, setLangState] = useState<LanguageCode>(defaultLang);
  const [remembered, setRemembered] = useState(false);

  // Use the language this shopkeeper picked last time, if any; otherwise the suggested default.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      // Read once after mount (reading earlier would not match the server-rendered page).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && LANGUAGES.some((l) => l.code === saved)) { setLangState(saved as LanguageCode); setRemembered(true); }
    } catch { /* storage unavailable: keep the default */ }
  }, []);

  function setLang(code: LanguageCode) {
    setLangState(code);
    setRemembered(true);
    try { localStorage.setItem(LANG_KEY, code); } catch { /* ignore */ }
  }
  const [occasion, setOccasion] = useState<OccasionId | "">(initialOccasion);
  const [ask, setAsk] = useState("");
  const [custom, setCustom] = useState("");
  const [line, setLine] = useState("");
  const [withBackground, setWithBackground] = useState(false);
  const [everyLanguage, setEveryLanguage] = useState(false);
  const labelOf = (code: string) => LANGUAGES.find((l) => l.code === code)?.label ?? code;
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
        body: JSON.stringify({ workspaceId, ...(everyLanguage ? { langs: customerLangs } : { lang }), occasion: custom.trim() ? undefined : occasion || undefined, headline: custom.trim() || undefined, line: line.trim() || undefined, withBackground }),
      });
      const json = (await res.json()) as { url?: string; error?: string; imagesRemaining?: number; urls?: Partial<Record<LanguageCode, string>>; skipped?: LanguageCode[] };
      if (!res.ok || !json.url) setError(json.error ?? "Could not make the card.");
      else setMade({ url: json.url, imagesRemaining: json.imagesRemaining, urls: everyLanguage ? json.urls : undefined, skipped: json.skipped });
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
          <label className="sk-label">{t.askLabel}</label>
          <input value={ask} onChange={(e) => onAsk(e.target.value)} className="sk-input" placeholder={t.askPlaceholder} />
        </div>

        <div>
          <label className="sk-label">{t.occasion}</label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => { setOccasion(o.id); setCustom(""); }}
                className={`rounded-full border px-3 py-1 text-[12.5px] ${occasion === o.id && !custom ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:text-foreground"}`}
              >
                {o.label[uiLang]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="sk-label">{t.ownHeading}</label>
          <input value={custom} onChange={(e) => setCustom(e.target.value)} className="sk-input" maxLength={80} lang={lang} />
        </div>

        <div>
          <label className="sk-label">{t.cardLanguage}</label>
          <select value={lang} onChange={(e) => setLang(e.target.value as LanguageCode)} className="sk-input">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <p className="mt-1 text-[12px] text-faint">
            {remembered ? t.hintRemembered : fromCustomers ? t.hintCustomers : t.hintApp}
          </p>
        </div>

        <div>
          <label className="sk-label">{t.offerLabel}</label>
          <input value={line} onChange={(e) => setLine(e.target.value)} className="sk-input" maxLength={120} lang={lang} placeholder={t.offerPlaceholder} />
        </div>

        {customerLangs.length > 1 && (
          <label className="flex items-start gap-2 text-[13px]">
            <input type="checkbox" checked={everyLanguage} onChange={(e) => setEveryLanguage(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
            <span>
              {t.everyLanguage} ({customerLangs.map(labelOf).join(", ")})
              <span className="block text-[12px] text-faint">{t.everyLanguageHelp}</span>
            </span>
          </label>
        )}

        <label className="flex items-start gap-2 text-[13px]">
          <input type="checkbox" checked={withBackground} onChange={(e) => setWithBackground(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
          <span>
            {t.picture}
            <span className="block text-[12px] text-faint">{t.pictureHelp}</span>
          </span>
        </label>

        {!hasLogo && (
          <p className="text-[12.5px] text-faint">
            {t.noLogo} <Link href="/settings/brand" className="text-accent hover:text-accent-hover">{t.addLogo}</Link> {t.noLogoTail}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button type="button" onClick={make} disabled={busy} className="sk-btn sk-btn-primary disabled:opacity-60">
            {busy ? t.making : made ? t.makeAgain : t.make}
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
        {made?.urls ? (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(made.urls).map(([code, url]) => (
              <div key={code}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Card in ${labelOf(code)}`} className="aspect-square w-full rounded-lg border border-border object-contain" />
                <div className="mt-1 text-[12px] text-faint">{labelOf(code)}</div>
              </div>
            ))}
          </div>
        ) : (
        <div className="sk-card flex aspect-square items-center justify-center overflow-hidden">
          {made ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={made.url} alt="Your card" className="h-full w-full object-contain" />
          ) : (
            <span className="px-6 text-center text-[13px] text-faint">{t.placeholder}</span>
          )}
        </div>
        )}
        {made?.skipped && made.skipped.length > 0 && (
          <p className="mt-2 text-[12.5px] text-danger">No card was made in {made.skipped.map(labelOf).join(", ")}, because the offer could not be translated safely. Make those one at a time.</p>
        )}
        {made && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link href={made.urls ? `/campaigns?cards=${encodeURIComponent(JSON.stringify(made.urls))}` : `/campaigns?card=${encodeURIComponent(made.url)}`} className="sk-btn sk-btn-primary">{t.send}</Link>
            {!made.urls && <a href={made.url} download target="_blank" rel="noreferrer" className="sk-btn">{t.download}</a>}
            {typeof made.imagesRemaining === "number" && <span className="text-[12px] text-faint">{fillN(t.picturesLeft, made.imagesRemaining)}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

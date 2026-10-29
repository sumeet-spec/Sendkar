"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import { fillN } from "@/lib/i18n/appCopy";
import type { LibraryCopy } from "@/lib/i18n/libraryCopy";
import { shortDate } from "@/lib/festivals";

export type LibraryFestival = {
  id: string;
  name: string;
  occasion: string;
  /** The festival's greeting in the chosen language. */
  title: string;
  dateLabel: string;
  exact: boolean;
  daysLeft: number;
  stage: "now" | "soon" | "later";
  released: boolean;
  releaseDate: string;
  designs: Array<{ id: string; name: string }>;
};

const LANG_KEY = "sk_library_lang";

export function LibraryBrowser({ workspaceId, lang, langFromUrl, festivals, anyTime, initialFestival, customerLangs, hasKit, t }: {
  workspaceId: string; lang: LanguageCode; langFromUrl: boolean; festivals: LibraryFestival[]; anyTime: LibraryFestival[]; initialFestival: string | null;
  customerLangs: LanguageCode[]; hasKit: boolean; t: LibraryCopy;
}) {
  const router = useRouter();
  const all = [...festivals, ...anyTime];
  const firstOpen = festivals.find((f) => f.released) ?? anyTime[0];
  const [festivalId, setFestivalId] = useState(all.find((f) => f.id === initialFestival && f.released)?.id ?? firstOpen.id);
  const festival = all.find((f) => f.id === festivalId) ?? firstOpen;
  const [designChoice, setDesignChoice] = useState<string | null>(null);
  const designId = festival.designs.some((d) => d.id === designChoice) ? designChoice! : festival.designs[0]?.id;

  const [cardLangPick, setCardLangPick] = useState<LanguageCode | null>(null);
  const cardLang = cardLangPick ?? lang;
  const [mode, setMode] = useState<"festival" | "brand">("festival");
  const [line, setLine] = useState("");
  const [shownLine, setShownLine] = useState("");
  const [everyLanguage, setEveryLanguage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labelOf = (code: string) => LANGUAGES.find((l) => l.code === code)?.label ?? code;

  // Come back to the language this shopkeeper chose last time, unless the link names one.
  useEffect(() => {
    if (langFromUrl) return;
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && saved !== lang && LANGUAGES.some((l) => l.code === saved)) router.replace(`/library?lang=${saved}`);
    } catch { /* storage unavailable: keep the default */ }
  }, [langFromUrl, lang, router]);

  function chooseLang(code: LanguageCode) {
    try { localStorage.setItem(LANG_KEY, code); } catch { /* ignore */ }
    setCardLangPick(null);
    setFestivalId(firstOpen.id);
    setDesignChoice(null);
    router.replace(`/library?lang=${code}`);
  }

  const preview = (id: string, size: number, withLine = true) => {
    const q = new URLSearchParams({ workspaceId, design: id, lang: cardLang, mode, size: String(size) });
    if (withLine && shownLine.trim()) q.set("line", shownLine.trim());
    return `/api/library/preview?${q.toString()}`;
  };

  async function send() {
    if (!designId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cards/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, designId, colourMode: mode, line: line.trim() || undefined, ...(everyLanguage ? { langs: customerLangs } : { lang: cardLang }) }),
      });
      const json = (await res.json()) as { url?: string; urls?: Record<string, string>; error?: string };
      if (!res.ok || !json.url) { setError(json.error ?? "Could not get the card ready."); return; }
      router.push(everyLanguage && json.urls ? `/campaigns?cards=${encodeURIComponent(JSON.stringify(json.urls))}` : `/campaigns?card=${encodeURIComponent(json.url)}`);
    } catch {
      setError("Could not get the card ready. Check your internet and try again.");
    } finally {
      setBusy(false);
    }
  }

  const countdown = (f: LibraryFestival) => (f.daysLeft < 0 ? "" : f.daysLeft === 0 ? t.today : f.daysLeft === 1 ? t.tomorrow : fillN(t.inDays, f.daysLeft));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="mb-1 text-xl font-semibold tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted">{t.intro}</p>
        </div>
        <div>
          <label className="sk-label">{t.festivalsFor}</label>
          <select value={lang} onChange={(e) => chooseLang(e.target.value as LanguageCode)} className="sk-input w-auto">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {!hasKit && (
        <div className="sk-card mb-5 p-3 text-[13px]">
          {t.brandEmpty} <Link href="/settings/brand" className="text-accent hover:text-accent-hover">{t.brandLink}</Link>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {[...festivals, ...anyTime].map((f) => {
          const active = f.id === festival.id;
          const isAny = f.id.startsWith("any-");
          return (
            <button
              key={f.id}
              type="button"
              disabled={!f.released}
              onClick={() => { setFestivalId(f.id); setDesignChoice(null); }}
              className={`rounded-xl border px-3 py-2 text-left text-[13px] ${active ? "border-accent bg-accent/10" : "border-border"} ${f.released ? "hover:border-accent" : "cursor-not-allowed opacity-55"}`}
            >
              <span className="flex items-center gap-2 font-medium">
                {isAny ? t.anyTime + ": " + f.title : f.name}
                {f.released && f.daysLeft > 35 && <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">{t.fresh}</span>}
              </span>
              <span className="block text-[11.5px] text-faint">
                {f.released ? (isAny ? "" : `${f.dateLabel} · ${countdown(f)}`) : t.comingSoon.replace("{date}", shortDate(f.releaseDate))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">{festival.id.startsWith("any-") ? festival.title : festival.name}</h2>
            <span className="text-[12px] text-faint">{fillN(t.designsLive, festival.designs.length)} · {t.free}</span>
          </div>
          {!festival.exact && <p className="mb-2 text-[12px] text-faint">{t.confirmDay}</p>}
          {festival.designs.length === 0 ? (
            <p className="text-sm text-muted">{t.none}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {festival.designs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDesignChoice(d.id)}
                  className={`overflow-hidden rounded-xl border text-left ${d.id === designId ? "border-accent ring-2 ring-accent/40" : "border-border"}`}
                  aria-label={d.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview(d.id, 360, false)} alt={d.name} loading="lazy" className="aspect-square w-full bg-[var(--surface-2)] object-cover" />
                  <span className="block px-2 py-1.5 text-[12px] text-muted">{d.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          {designId ? (
            <div className="sk-card p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview(designId, 640)} alt="" className="mb-4 aspect-square w-full rounded-lg bg-[var(--surface-2)] object-cover" />

              <div className="flex flex-col gap-3">
                <div>
                  <label className="sk-label">{t.cardLanguage}</label>
                  <select value={cardLang} onChange={(e) => setCardLangPick(e.target.value as LanguageCode)} className="sk-input">
                    {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="sk-label">{t.offerLabel}</label>
                  <input
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                    onBlur={() => setShownLine(line)}
                    onKeyDown={(e) => { if (e.key === "Enter") setShownLine(line); }}
                    className="sk-input"
                    maxLength={120}
                    lang={cardLang}
                    placeholder={t.offerPlaceholder}
                  />
                </div>
                <div>
                  <label className="sk-label">{t.colours}</label>
                  <div className="flex gap-2">
                    {(["festival", "brand"] as const).map((m) => (
                      <button key={m} type="button" onClick={() => setMode(m)} className={`flex-1 rounded-lg border px-2 py-1.5 text-[12.5px] ${mode === m ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"}`}>
                        {m === "festival" ? t.festivalColours : t.myColours}
                      </button>
                    ))}
                  </div>
                </div>
                {customerLangs.length > 1 && (
                  <label className="flex items-start gap-2 text-[12.5px]">
                    <input type="checkbox" checked={everyLanguage} onChange={(e) => setEveryLanguage(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
                    <span>{t.everyLanguage} ({customerLangs.map(labelOf).join(", ")})</span>
                  </label>
                )}
                <button type="button" onClick={send} disabled={busy} className="sk-btn sk-btn-primary h-11 disabled:opacity-60">
                  {busy ? t.sending : t.send}
                </button>
                {error && (
                  <p className="text-sm text-danger">
                    {error} {error.toLowerCase().includes("brand kit") && <Link href="/settings/brand" className="underline">{t.brandLink}</Link>}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">{t.pick}</p>
          )}
        </div>
      </div>
    </div>
  );
}

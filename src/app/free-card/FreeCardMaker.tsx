"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import type { FreeCardCopy } from "@/lib/i18n/freeCardCopy";
import { FREE_CARD_COLOURS } from "@/lib/freeCard";
import { Logo } from "@/components/Logo";

export type FreeFestival = { id: string; name: string; designs: string[] };

export function FreeCardMaker({ lang, t, festivals, initialFestival, src }: { lang: LanguageCode; t: FreeCardCopy; festivals: FreeFestival[]; initialFestival: string | null; src: string }) {
  const router = useRouter();
  const [festivalId, setFestivalId] = useState(festivals.find((f) => f.id === initialFestival)?.id ?? festivals[0].id);
  const festival = festivals.find((f) => f.id === festivalId) ?? festivals[0];
  const [name, setName] = useState("");
  const [line, setLine] = useState("");
  const [colour, setColour] = useState("festival");
  const [shown, setShown] = useState({ name: "", line: "" });
  const [designId, setDesignId] = useState<string | null>(null);
  const [needName, setNeedName] = useState(false);

  const chosen = festival.designs.includes(designId ?? "") ? designId! : festival.designs[0];
  const cardName = shown.name || t.sampleName;

  const url = (design: string, extra: Record<string, string> = {}) => {
    const q = new URLSearchParams({ design, lang, name: cardName, c: colour, ...extra });
    if (shown.line) q.set("line", shown.line);
    if (src) q.set("src", src);
    return `/api/free-card?${q.toString()}`;
  };

  function make() {
    if (!name.trim()) { setNeedName(true); return; }
    setNeedName(false);
    setShown({ name: name.trim(), line: line.trim() });
  }

  function chooseLang(code: LanguageCode) {
    router.replace(`/free-card?lang=${code}${src ? `&src=${encodeURIComponent(src)}` : ""}`);
  }

  // The shared link always points at the live site, the same on the server and in the browser.
  const site = `https://www.sendkar.shop/free-card?lang=${lang}`;
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(t.shareText.replace("{shop}", shown.name || t.sampleName).replace("{url}", site))}`;

  return (
    <div lang={lang}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Logo size="md" />
          <span className="text-lg font-semibold tracking-tight">Sendkar</span>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {LANGUAGES.map((l) => (
            <button key={l.code} type="button" onClick={() => chooseLang(l.code)} className={`min-h-9 rounded-full border px-3 py-1 text-[13px] ${l.code === lang ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"}`}>{l.label}</button>
          ))}
        </div>
      </div>

      <h1 className="mb-1 text-2xl font-semibold leading-snug tracking-tight">{t.title}</h1>
      <p className="mb-6 text-sm text-muted">{t.sub}</p>

      <div className="sk-card mb-6 flex flex-col gap-4 p-4">
        <div>
          <label className="sk-label">{t.festival}</label>
          <div className="flex flex-wrap gap-2">
            {festivals.map((f) => (
              <button key={f.id} type="button" onClick={() => { setFestivalId(f.id); setDesignId(null); }} className={`min-h-10 rounded-full border px-3.5 py-1.5 text-[13.5px] ${f.id === festival.id ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"}`}>{f.name}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="sk-label" htmlFor="fc-name">{t.shopName}</label>
            <input id="fc-name" className="sk-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder={t.shopPlaceholder} lang={lang} />
            {needName && <p className="mt-1 text-[12.5px] text-danger">{t.needName}</p>}
          </div>
          <div>
            <label className="sk-label" htmlFor="fc-line">{t.offer}</label>
            <input id="fc-line" className="sk-input" value={line} onChange={(e) => setLine(e.target.value)} maxLength={100} placeholder={t.offerPlaceholder} lang={lang} />
          </div>
        </div>
        <div>
          <label className="sk-label">{t.colours}</label>
          <div className="flex gap-2">
            {FREE_CARD_COLOURS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setColour(c.key)}
                aria-label={c.label}
                className={`h-8 w-8 rounded-full border-2 ${colour === c.key ? "border-foreground" : "border-border"}`}
                style={{ background: c.primary ?? "conic-gradient(#f59e0b, #ef4444, #8b5cf6, #3b82f6, #f59e0b)" }}
              />
            ))}
          </div>
        </div>
        <button type="button" onClick={make} className="sk-btn sk-btn-primary h-11 text-[15px]">{t.make}</button>
      </div>

      <div className="mb-2 text-[13px] text-muted">{t.pick}</div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        {festival.designs.map((d) => (
          <button key={d} type="button" onClick={() => setDesignId(d)} className={`overflow-hidden rounded-xl border ${d === chosen ? "border-accent ring-2 ring-accent/40" : "border-border"}`} aria-label={d}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url(d, { size: "360" })} alt="" loading="lazy" className="aspect-square w-full bg-[var(--surface-2)] object-cover" />
          </button>
        ))}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url(chosen, { size: "640" })} alt="" className="aspect-square w-full rounded-xl border border-border bg-[var(--surface-2)] object-cover sm:max-w-sm" />
        <div className="flex flex-col gap-2 sm:w-52">
          <a href={url(chosen, { dl: "1" })} download className={`sk-btn sk-btn-primary ${shown.name ? "" : "pointer-events-none opacity-50"}`} onClick={(e) => { if (!shown.name) { e.preventDefault(); setNeedName(true); } }}>{t.download}</a>
          <a href={whatsappShare} target="_blank" rel="noreferrer" className="sk-btn">{t.share}</a>
        </div>
      </div>

      <LeadForm t={t} lang={lang} shopName={shown.name} designId={chosen} src={src} />

      <div className="sk-card mt-8 p-5 text-center">
        <h2 className="text-lg font-semibold leading-snug">{t.ctaTitle}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">{t.ctaSub}</p>
        <Link href={`/signup?src=freecard${src ? `-${encodeURIComponent(src)}` : ""}`} className="sk-btn sk-btn-primary mt-4 inline-flex h-11 px-6 text-[15px]">{t.ctaButton}</Link>
      </div>
    </div>
  );
}

function LeadForm({ t, lang, shopName, designId, src }: { t: FreeCardCopy; lang: LanguageCode; shopName: string; designId: string; src: string }) {
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<"badNumber" | "needConsent" | "error" | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) { setError("needConsent"); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/free-card/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shopName: shopName || t.sampleName, phone, lang, designId, consent, src }) });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) setDone(true);
      else setError(json.error === "badNumber" ? "badNumber" : json.error === "needConsent" ? "needConsent" : "error");
    } catch {
      setError("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sk-card p-4">
      <h3 className="mb-3 text-[15px] font-semibold">{t.leadTitle}</h3>
      {done ? (
        <p className="text-sm text-accent">{t.leadDone}</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="sk-label" htmlFor="fc-phone">{t.leadPhone}</label>
            <input id="fc-phone" className="sk-input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="98765 43210" />
          </div>
          <label className="flex items-start gap-2.5 text-[13px] leading-snug">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 flex-shrink-0 accent-[var(--accent)]" />
            <span>{t.leadConsent}</span>
          </label>
          {error && <p className="text-sm text-danger">{t[error]}</p>}
          <button type="submit" disabled={busy} className="sk-btn disabled:opacity-60">{t.leadButton}</button>
        </form>
      )}
    </div>
  );
}

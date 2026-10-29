"use client";

import { useState } from "react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import { JOIN_COPY, withShop } from "@/lib/joinCopy";

export function JoinForm({ code, initialLang, shopNames, logoUrl, color }: {
  code: string; initialLang: LanguageCode; shopNames: Record<LanguageCode, string>; logoUrl: string | null; color: string;
}) {
  const [lang, setLang] = useState<LanguageCode>(initialLang);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<keyof typeof JOIN_COPY.en | null>(null);

  const t = JOIN_COPY[lang];
  const shop = shopNames[lang];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) { setError("needConsent"); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/join/${code}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone, lang, consent }) });
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
    <div lang={lang}>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {LANGUAGES.map((l) => (
          <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`rounded-full border px-3 py-1 text-[13px] ${l.code === lang ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"}`}>
            {l.label}
          </button>
        ))}
      </div>

      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="mb-4 h-16 w-16 rounded-xl border border-border bg-white object-contain p-1" />
      )}
      <h1 className="mb-5 text-xl font-semibold leading-snug">{withShop(t.title, shop)}</h1>

      {done ? (
        <p className="rounded-lg border border-border p-4 text-[15px]" style={{ borderColor: color }}>{withShop(t.done, shop)}</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="sk-label" htmlFor="j-name">{t.name}</label>
            <input id="j-name" className="sk-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" />
          </div>
          <div>
            <label className="sk-label" htmlFor="j-phone">{t.phone}</label>
            <input id="j-phone" className="sk-input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" required placeholder="98765 43210" />
          </div>
          <label className="flex items-start gap-2.5 text-[14px] leading-snug">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 flex-shrink-0 accent-[var(--accent)]" />
            <span>{withShop(t.consent, shop)}</span>
          </label>
          {error && <p className="text-sm text-danger">{t[error]}</p>}
          <button type="submit" disabled={busy} className="sk-btn sk-btn-primary h-12 text-[15px] disabled:opacity-60" style={{ background: color }}>
            {t.button}
          </button>
        </form>
      )}
    </div>
  );
}

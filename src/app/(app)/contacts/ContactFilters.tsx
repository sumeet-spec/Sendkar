"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { LANGUAGES as APP_LANGUAGES } from "@/lib/i18n/dictionaries";
import type { ContactsUi } from "@/lib/i18n/contactsCopy";

// The languages the app writes in use their own names; the rest keep English names.
const EXTRA = [
  { value: "ar", label: "Arabic" }, { value: "es", label: "Spanish" }, { value: "pt_BR", label: "Portuguese" }, { value: "id", label: "Indonesian" },
  { value: "bn", label: "Bengali" }, { value: "pa", label: "Punjabi" }, { value: "ur", label: "Urdu" },
];

export function ContactFilters({ t, availableTags }: { t: ContactsUi; availableTags: string[] }) {
  const LANGUAGES = [{ value: "", label: t.allLanguages }, ...APP_LANGUAGES.map((l) => ({ value: l.code as string, label: l.label as string })), ...EXTRA];
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    startTransition(() => router.push(`?${params.toString()}`));
  }

  const q = sp.get("q") ?? "";
  const lang = sp.get("lang") ?? "";
  const tag = sp.get("tag") ?? "";
  const optedOut = sp.get("optedOut") ?? "";

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <input
        type="text"
        defaultValue={q}
        onChange={(e) => update("q", e.target.value)}
        placeholder={t.search}
        className="sk-input w-52 text-sm"
      />
      <select
        value={lang}
        onChange={(e) => update("lang", e.target.value)}
        className="sk-input w-40 text-sm"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>{l.label}</option>
        ))}
      </select>
      {availableTags.length > 0 && (
        <select
          value={tag}
          onChange={(e) => update("tag", e.target.value)}
          className="sk-input w-40 text-sm"
        >
          <option value="">{t.allTags}</option>
          {availableTags.map((tg) => (
            <option key={tg} value={tg}>{tg}</option>
          ))}
        </select>
      )}
      <button
        onClick={() => update("optedOut", optedOut ? "" : "1")}
        className={`sk-pill whitespace-nowrap transition-colors ${
          optedOut ? "border-danger text-danger" : "hover:border-foreground/50"
        }`}
      >
        {optedOut ? t.optedOutOnly : t.optedOut}
      </button>
      {(q || lang || tag || optedOut) && (
        <button
          onClick={() => startTransition(() => router.push("?"))}
          className="text-[12.5px] text-faint hover:text-foreground"
        >
          {t.clearFilters}
        </button>
      )}
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const LANGUAGES = [
  { value: "", label: "All languages" },
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "kn", label: "Kannada" },
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "es", label: "Spanish" },
  { value: "pt_BR", label: "Portuguese" },
  { value: "id", label: "Indonesian" },
  { value: "bn", label: "Bengali" },
  { value: "gu", label: "Gujarati" },
  { value: "pa", label: "Punjabi" },
  { value: "ur", label: "Urdu" },
];

export function ContactFilters({ availableTags }: { availableTags: string[] }) {
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
        placeholder="Search phone or name…"
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
          <option value="">All tags</option>
          {availableTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      )}
      <button
        onClick={() => update("optedOut", optedOut ? "" : "1")}
        className={`sk-pill whitespace-nowrap transition-colors ${
          optedOut ? "border-danger text-danger" : "hover:border-foreground/50"
        }`}
      >
        {optedOut ? "✕ Opted-out only" : "Opted-out"}
      </button>
      {(q || lang || tag || optedOut) && (
        <button
          onClick={() => startTransition(() => router.push("?"))}
          className="text-[12.5px] text-faint hover:text-foreground"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

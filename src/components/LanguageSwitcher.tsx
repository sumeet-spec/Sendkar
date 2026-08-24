"use client";

import { useTransition } from "react";
import { setUiLanguage } from "@/lib/i18n/actions";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";

export function LanguageSwitcher({ current, compact = false }: { current: LanguageCode; compact?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => startTransition(() => setUiLanguage(e.target.value as LanguageCode))}
      className={compact ? "sk-input w-auto text-[12px]" : "sk-input w-auto text-[13px]"}
      aria-label="Language"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}

"use client";

import { useTransition } from "react";
import { setUiLanguage } from "@/lib/i18n/actions";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";

/**
 * Every language as a visible button, each written in its own script. A small dropdown is easy to miss
 * and asks the visitor to read English to find their language; these can be spotted at a glance.
 */
export function LanguageChips({ current }: { current: LanguageCode }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Language">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={l.code === current}
          disabled={pending}
          onClick={() => startTransition(() => setUiLanguage(l.code))}
          className="sk-site-chip disabled:opacity-70"
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { TemplatesUi } from "@/lib/i18n/templatesCopy";


const STATUSES = ["all", "approved", "pending", "rejected"] as const;

export function TemplateFilters({ t }: { t: TemplatesUi }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const status = sp.get("status") ?? "all";
  const q = sp.get("q") ?? "";

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    startTransition(() => router.push(`?${params.toString()}`));
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <input
        type="text"
        defaultValue={q}
        onChange={(e) => update("q", e.target.value)}
        placeholder={t.search}
        className="sk-input w-56 text-sm"
      />
      <div className="flex gap-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => update("status", s)}
            className={`sk-pill transition-colors ${
              status === s
                ? "border-accent bg-accent text-[#05130a]"
                : "hover:border-foreground/50"
            }`}
          >
            {t[s]}
          </button>
        ))}
      </div>
    </div>
  );
}

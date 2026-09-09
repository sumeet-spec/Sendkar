"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

export function AnalyticsFilters({ days }: { days: number }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  function setDays(d: string) {
    const params = new URLSearchParams(sp.toString());
    params.set("days", d);
    startTransition(() => router.push(`?${params.toString()}`));
  }

  return (
    <div className="flex gap-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setDays(o.value)}
          className={`sk-pill transition-colors ${
            days === Number(o.value)
              ? "border-accent bg-accent text-[#05130a]"
              : "hover:border-foreground/50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

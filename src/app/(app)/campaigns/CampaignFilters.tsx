"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const STATUSES = ["all", "draft", "sending", "paused", "completed"] as const;

export function CampaignFilters({ q, status }: { q: string; status: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1" style={{ minWidth: 200 }}>
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          stroke="var(--faint)"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="5.5" cy="5.5" r="4" />
          <path d="M9 9l2.5 2.5" />
        </svg>
        <input
          defaultValue={q}
          onChange={(e) => update("q", e.target.value)}
          className="sk-input w-full pl-8 text-[13px]"
          placeholder="Search campaigns…"
        />
      </div>

      <div className="flex gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => update("status", s)}
            className="sk-pill cursor-pointer text-[11.5px] capitalize"
            style={
              (s === "all" && !status) || status === s
                ? { borderColor: "var(--accent)", color: "var(--accent)", background: "var(--accent-glow)" }
                : undefined
            }
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

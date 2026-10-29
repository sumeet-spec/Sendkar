"use client";

import { useState, useTransition } from "react";
import { setDailySummary } from "./summaryActions";

export function SummaryToggle({ enabled, onLabel, offLabel }: { enabled: boolean; onLabel: string; offLabel: string }) {
  const [on, setOn] = useState(enabled);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="mt-3 text-[12.5px] text-accent hover:text-accent-hover disabled:opacity-60"
      onClick={() => start(async () => { const next = !on; setOn(next); await setDailySummary(next); })}
    >
      {on ? offLabel : onLabel}
    </button>
  );
}

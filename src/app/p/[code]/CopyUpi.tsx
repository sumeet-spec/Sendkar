"use client";

import { useState } from "react";

export function CopyUpi({ upiId, label, copy, copied }: { upiId: string; label: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5 text-left text-[13px]">
      <div className="min-w-0">
        <div className="text-[11.5px] text-faint">{label}</div>
        <div className="truncate font-medium">{upiId}</div>
      </div>
      <button
        type="button"
        className="flex-none text-[13px] font-medium text-accent"
        onClick={async () => { try { await navigator.clipboard.writeText(upiId); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* clipboard blocked: the id is shown to copy by hand */ } }}
      >
        {done ? copied : copy}
      </button>
    </div>
  );
}

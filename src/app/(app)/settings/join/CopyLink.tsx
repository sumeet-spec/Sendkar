"use client";

import { useState } from "react";

export function CopyLink({ url, copyLabel, copiedLabel }: { url: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <input readOnly value={url} className="sk-input flex-1 font-mono text-[12.5px]" onFocus={(e) => e.currentTarget.select()} />
      <button
        type="button"
        className="sk-btn"
        onClick={async () => {
          try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* the field is selectable as a fallback */ }
        }}
      >
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { resendBill } from "./actions";

export function ResendButton({ id, label }: { id: string; label: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button" disabled={pending}
        className="text-[12.5px] text-accent hover:text-accent-hover disabled:opacity-50"
        onClick={() => { setError(null); startTransition(async () => { const r = await resendBill(id); if (r.error) setError(r.error); }); }}
      >
        {label}
      </button>
      {error && <span className="max-w-[220px] text-right text-[11.5px] text-danger">{error}</span>}
    </span>
  );
}

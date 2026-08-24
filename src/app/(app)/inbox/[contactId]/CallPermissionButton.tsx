"use client";

import { useState, useTransition } from "react";
import { sendCallPermissionRequest } from "@/app/(app)/settings/calling/actions";

export function CallPermissionButton({ phone }: { phone: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);

  return (
    <div className="sk-card p-4">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">Calling</div>
      <button
        disabled={pending}
        onClick={() => startTransition(async () => setResult(await sendCallPermissionRequest(phone)))}
        className="sk-btn sk-btn-ghost w-full text-[12.5px] disabled:opacity-60"
      >
        {pending ? "Sending…" : "📞 Request call permission"}
      </button>
      {result?.error && <p className="mt-2 text-[11.5px] text-danger">{result.error}</p>}
      {result?.success && <p className="mt-2 text-[11.5px] text-accent">Sent.</p>}
    </div>
  );
}

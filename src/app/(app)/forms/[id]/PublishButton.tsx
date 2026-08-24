"use client";

import { useState, useTransition } from "react";
import { publishWaFlow } from "../actions";

export function PublishButton({ waFlowId, status, disabled }: { waFlowId: string; status: string; disabled: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status === "published") return null;

  return (
    <div className="text-right">
      <button
        disabled={disabled || pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await publishWaFlow(waFlowId);
            if (result.error) setError(result.error);
          })
        }
        className="sk-btn sk-btn-primary disabled:opacity-60"
      >
        {pending ? "Publishing…" : "Publish to WhatsApp"}
      </button>
      {error && <p className="mt-1.5 max-w-xs text-[12px] text-danger">{error}</p>}
    </div>
  );
}

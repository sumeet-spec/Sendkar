"use client";

import { useTransition } from "react";
import { deleteCannedResponse } from "./actions";

export function CannedResponseRow({ response }: { response: { id: string; shortcut: string; body: string } }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`sk-card p-4 ${pending ? "opacity-60" : ""}`}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[13px] text-accent">/{response.shortcut}</span>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete "/${response.shortcut}"?`)) {
              startTransition(async () => { await deleteCannedResponse(response.id); });
            }
          }}
          className="text-xs text-faint hover:text-danger"
        >
          Delete
        </button>
      </div>
      <p className="text-[13px] text-muted" style={{ whiteSpace: "pre-wrap" }}>{response.body}</p>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { deleteOutboundWebhook } from "./actions";

export function WebhookRow({ webhook }: { webhook: { id: string; url: string; events: string[]; secret: string } }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="sk-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[13px]">{webhook.url}</span>
        <button disabled={pending} onClick={() => startTransition(() => deleteOutboundWebhook(webhook.id))} className="text-xs text-faint hover:text-danger">
          Delete
        </button>
      </div>
      <div className="mb-2 flex gap-1.5">
        {webhook.events.map((e) => <span key={e} className="sk-pill">{e}</span>)}
      </div>
      <div className="text-[11.5px] text-faint">Signing secret: <span className="font-mono">{webhook.secret}</span></div>
    </div>
  );
}

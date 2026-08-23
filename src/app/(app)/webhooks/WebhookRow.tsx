"use client";

import { useState, useTransition } from "react";
import { deleteOutboundWebhook } from "./actions";

interface Delivery {
  event: string;
  status: string;
  attempts: number;
  response_status: number | null;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  success: "border-accent text-accent",
  failed: "border-danger text-danger",
  pending: "text-faint",
};

export function WebhookRow({
  webhook,
  recentDeliveries,
}: {
  webhook: { id: string; url: string; events: string[]; secret: string };
  recentDeliveries: Delivery[];
}) {
  const [pending, startTransition] = useTransition();
  const [showLog, setShowLog] = useState(false);

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

      <button onClick={() => setShowLog((v) => !v)} className="mt-2 text-[12px] text-accent hover:text-accent-hover">
        {showLog ? "Hide" : "Show"} recent deliveries ({recentDeliveries.length})
      </button>

      {showLog && (
        <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-2">
          {recentDeliveries.length === 0 && <p className="text-[12px] text-faint">No deliveries yet.</p>}
          {recentDeliveries.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-[12px]">
              <span className="font-mono text-faint">{d.event}</span>
              <span className="text-faint">{d.attempts} attempt{d.attempts !== 1 ? "s" : ""}</span>
              <span className={`sk-pill ${STATUS_STYLE[d.status] ?? ""}`}>
                {d.status}{d.response_status ? ` (${d.response_status})` : ""}
              </span>
              <span className="text-faint">{new Date(d.created_at).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

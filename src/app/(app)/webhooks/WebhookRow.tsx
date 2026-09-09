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

function formatDeliveryTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function WebhookRow({
  webhook,
  recentDeliveries,
}: {
  webhook: { id: string; url: string; events: string[]; secret: string };
  recentDeliveries: Delivery[];
}) {
  const [pending, startTransition] = useTransition();
  const [showLog, setShowLog] = useState(false);

  const failCount = recentDeliveries.filter((d) => d.status === "failed").length;

  return (
    <div className="sk-card p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="break-all font-mono text-[13px]">{webhook.url}</span>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm(`Delete webhook for ${webhook.url}?`)) {
              startTransition(async () => { await deleteOutboundWebhook(webhook.id); });
            }
          }}
          className="flex-shrink-0 text-xs text-faint hover:text-danger"
        >
          Delete
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {webhook.events.map((e) => <span key={e} className="sk-pill font-mono text-[11px]">{e}</span>)}
      </div>

      <div className="mb-2 text-[11.5px] text-faint">
        Signing secret: <span className="font-mono">{webhook.secret}</span>
      </div>

      <button
        onClick={() => setShowLog((v) => !v)}
        className="flex items-center gap-1.5 text-[12px] text-accent hover:text-accent-hover"
      >
        {showLog ? "Hide" : "Show"} deliveries ({recentDeliveries.length})
        {failCount > 0 && (
          <span className="sk-pill border-danger text-danger text-[10.5px]">{failCount} failed</span>
        )}
      </button>

      {showLog && (
        <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-2">
          {recentDeliveries.length === 0 && <p className="text-[12px] text-faint">No deliveries yet.</p>}
          {recentDeliveries.map((d, i) => (
            <div key={i} className="flex items-center gap-3 text-[12px]">
              <span className="flex-1 truncate font-mono text-faint">{d.event}</span>
              <span className="text-faint">{d.attempts} attempt{d.attempts !== 1 ? "s" : ""}</span>
              <span className={`sk-pill ${STATUS_STYLE[d.status] ?? ""}`}>
                {d.status}{d.response_status ? ` ${d.response_status}` : ""}
              </span>
              <span className="flex-shrink-0 text-faint">{formatDeliveryTime(d.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

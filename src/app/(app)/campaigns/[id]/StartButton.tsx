"use client";

import { useState, useTransition } from "react";
import { startCampaign, scheduleCampaign, pauseCampaign, resumeCampaign } from "../actions";

function minDateTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 60);
  return d.toISOString().slice(0, 16);
}

export function CampaignControls({ campaignId, status, scheduledAt }: { campaignId: string; status: string; scheduledAt?: string | null }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(minDateTime());

  if (status === "draft") {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await startCampaign(campaignId);
                if (result.error) setError(result.error);
              })
            }
            className="sk-btn sk-btn-primary disabled:opacity-60"
          >
            {pending && !showScheduler ? "Starting…" : "Send now"}
          </button>
          <button
            type="button"
            onClick={() => setShowScheduler((v) => !v)}
            className="sk-btn sk-btn-ghost"
          >
            Schedule
          </button>
        </div>

        {showScheduler && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-[var(--surface-2)] p-3">
            <input
              type="datetime-local"
              className="sk-input text-[13px]"
              value={scheduledTime}
              min={minDateTime()}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            <button
              disabled={pending || !scheduledTime}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  const result = await scheduleCampaign(campaignId, new Date(scheduledTime).toISOString());
                  if (result.error) setError(result.error);
                })
              }
              className="sk-btn sk-btn-primary flex-shrink-0 disabled:opacity-60"
            >
              {pending ? "Scheduling…" : "Confirm schedule"}
            </button>
          </div>
        )}

        <p className="text-[12px] text-faint">
          Messages go out in the next daily sending window (once every 24h), not instantly — this keeps everyone safely under Meta&apos;s per-number sending limits.
        </p>
        {error && <p className="text-[12px] text-danger">{error}</p>}
      </div>
    );
  }

  if (status === "sending") {
    return (
      <div className="flex flex-col items-end gap-1">
        {scheduledAt && new Date(scheduledAt) > new Date() && (
          <div className="text-[12px] text-faint">
            Scheduled for{" "}
            <span className="font-medium text-accent">
              {new Date(scheduledAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}
        <button
          disabled={pending}
          onClick={() => startTransition(() => pauseCampaign(campaignId))}
          className="sk-btn sk-btn-ghost disabled:opacity-60"
        >
          Pause
        </button>
      </div>
    );
  }

  if (status === "paused") {
    return (
      <button
        disabled={pending}
        onClick={() => startTransition(() => resumeCampaign(campaignId))}
        className="sk-btn sk-btn-primary disabled:opacity-60"
      >
        Resume
      </button>
    );
  }

  return null;
}

"use client";

import { useState, useTransition } from "react";
import { startCampaign, pauseCampaign, resumeCampaign } from "../actions";

export function CampaignControls({ campaignId, status }: { campaignId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status === "draft") {
    return (
      <div>
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
          {pending ? "Starting…" : "Start sending"}
        </button>
        <p className="mt-1.5 text-[12px] text-faint">
          Messages go out in the next daily sending window (once every 24h), not instantly — this keeps everyone
          safely under Meta&apos;s per-number sending limits.
        </p>
        {error && <p className="mt-1.5 text-[12px] text-danger">{error}</p>}
      </div>
    );
  }
  if (status === "sending") {
    return (
      <button
        disabled={pending}
        onClick={() => startTransition(() => pauseCampaign(campaignId))}
        className="sk-btn sk-btn-ghost disabled:opacity-60"
      >
        Pause
      </button>
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

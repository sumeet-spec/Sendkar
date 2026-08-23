"use client";

import { useTransition } from "react";
import { startCampaign, pauseCampaign, resumeCampaign } from "../actions";

export function CampaignControls({ campaignId, status }: { campaignId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  if (status === "draft") {
    return (
      <button
        disabled={pending}
        onClick={() => startTransition(() => startCampaign(campaignId))}
        className="sk-btn sk-btn-primary disabled:opacity-60"
      >
        {pending ? "Starting…" : "Start sending"}
      </button>
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

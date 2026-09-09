"use client";

import { useTransition } from "react";
import { retryFailedRecipients, cloneCampaign } from "../actions";

export function CampaignActions({
  campaignId,
  failedCount,
  status,
}: {
  campaignId: string;
  failedCount: number;
  status: string;
}) {
  const [cloning, startClone] = useTransition();
  const [retrying, startRetry] = useTransition();

  return (
    <div className="flex gap-2">
      {failedCount > 0 && status !== "draft" && (
        <button
          disabled={retrying || cloning}
          onClick={() =>
            startRetry(async () => {
              await retryFailedRecipients(campaignId);
            })
          }
          className="sk-btn sk-btn-ghost disabled:opacity-60"
          style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
        >
          {retrying ? "Retrying…" : `Retry failed (${failedCount})`}
        </button>
      )}
      <button
        disabled={cloning || retrying}
        onClick={() =>
          startClone(async () => {
            await cloneCampaign(campaignId);
          })
        }
        className="sk-btn sk-btn-ghost disabled:opacity-60"
      >
        {cloning ? "Duplicating…" : "Duplicate"}
      </button>
    </div>
  );
}

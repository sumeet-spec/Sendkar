"use client";

import { useTransition } from "react";
import { retryFailedRecipients, cloneCampaign } from "../actions";
import type { CampaignsMoreUi } from "@/lib/i18n/campaignsMoreCopy";


export function CampaignActions({
  campaignId,
  failedCount,
  status,
  t,
}: {
  t: CampaignsMoreUi["actions"];
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
          {retrying ? t.retrying : t.retryFailed.replace("{n}", String(failedCount))}
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
        {cloning ? t.duplicating : t.duplicate}
      </button>
    </div>
  );
}

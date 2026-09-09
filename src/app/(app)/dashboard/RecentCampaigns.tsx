import Link from "next/link";
import type { CampaignPerfRow } from "@/lib/dashboardMetrics";

const STATUS_DOT: Record<string, string> = {
  completed: "var(--accent)",
  sending: "#60a5fa",
  paused: "var(--warn)",
  draft: "var(--faint)",
};

export function RecentCampaigns({ campaigns }: { campaigns: CampaignPerfRow[] }) {
  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-8 text-center">
        <div className="mb-2 text-[13px] font-medium text-foreground">No campaigns yet</div>
        <p className="text-[12px] text-faint">
          Every campaign needs an approved template — create one first, then run a campaign.
        </p>
        <Link href="/campaigns" className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent hover:text-accent-hover">
          Start a campaign
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 6h7M6 2.5L9.5 6L6 9.5" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {campaigns.map((c) => (
        <div key={c.id} className="flex items-center gap-3 border-b border-border px-5 py-2.5 last:border-0">
          {/* Status dot */}
          <div
            className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
            style={{ background: STATUS_DOT[c.status] ?? "var(--faint)" }}
          />
          {/* Name + date */}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">{c.name}</div>
            <div className="text-[11px] text-faint">
              {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
          {/* Sent count */}
          <div className="text-right">
            <div className="font-mono text-[13px] tabular-nums">{c.sent.toLocaleString()}</div>
            <div className="text-[10.5px] text-faint">sent</div>
          </div>
          {/* Delivery rate */}
          <div className="w-14 text-right">
            {c.deliveryRate !== null ? (
              <>
                <div
                  className="font-mono text-[13px] font-semibold tabular-nums"
                  style={{
                    color:
                      c.deliveryRate >= 85
                        ? "var(--accent)"
                        : c.deliveryRate >= 70
                          ? "var(--foreground)"
                          : "var(--danger)",
                  }}
                >
                  {c.deliveryRate}%
                </div>
                <div className="text-[10.5px] text-faint">delivery</div>
              </>
            ) : (
              <div className="font-mono text-[13px] text-faint">—</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Report } from "@/lib/deliveryReport";
import { fillN, type AppCopy } from "@/lib/i18n/appCopy";

/** Progress bar and plain-words report. While the campaign is sending, the page quietly refreshes itself. */
export function CampaignProgress({ report, status, t }: { report: Report; status: string; t: AppCopy["report"] }) {
  const router = useRouter();
  const sending = status === "sending";

  useEffect(() => {
    if (!sending) return;
    const timer = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(timer);
  }, [sending, router]);

  if (report.total === 0) return null;
  const finished = status === "completed";
  const fmt = (n: number) => n.toLocaleString("en-IN");

  return (
    <div className="sk-card mb-6 p-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="text-sm font-medium">
          {finished ? t.finished : sending ? t.sending : status === "paused" ? t.paused : t.ready}
        </div>
        <div className="text-[12.5px] text-faint">{fillN(t.percentDone, report.percentDone)}</div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={report.percentDone} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${report.percentDone}%` }} />
      </div>

      <ul className="mt-3 flex flex-col gap-1 text-[13.5px]">
        <li>{fillN(t.gotIt, fmt(report.gotIt), fmt(report.total))}{report.read > 0 ? `, ${fillN(t.andRead, fmt(report.read))}` : ""}.</li>
        {report.stillWaiting > 0 && <li>{fillN(sending ? t.toGo : t.waiting, fmt(report.stillWaiting))}</li>}
        {report.failed.map((f) => (
          <li key={f.kind} className="text-muted">{fillN(t[f.kind], fmt(f.count))}</li>
        ))}
      </ul>
    </div>
  );
}

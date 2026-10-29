import { createAdminClient } from "@/lib/supabase/admin";
import { gatherSummary, hasNews, yesterdayInIndia, summaryWhatsAppEnabled } from "@/lib/dailySummary";
import type { SummaryCopy } from "@/lib/i18n/summaryCopy";
import { SummaryToggle } from "./SummaryToggle";

/** Yesterday's numbers in plain words, so the owner sees at a glance whether anything happened. */
export async function YesterdayCard({ workspaceId, enabled, t }: { workspaceId: string; enabled: boolean; t: SummaryCopy }) {
  const { from, to } = yesterdayInIndia();
  const s = await gatherSummary(createAdminClient(), workspaceId, from, to);
  const cells: Array<[string, number]> = [[t.sent, s.sent], [t.replies, s.replies], [t.read, s.read], [t.newCustomers, s.newCustomers]];

  return (
    <div className="sk-card mb-4 p-4">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-faint">{t.title}</div>
      {hasNews(s) ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cells.map(([label, n]) => (
            <div key={label}>
              <div className="text-xl font-semibold tabular-nums">{n.toLocaleString("en-IN")}</div>
              <div className="text-[12px] text-faint">{label}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13.5px] text-muted">{t.quiet}</p>
      )}
      {summaryWhatsAppEnabled() && <SummaryToggle enabled={enabled} onLabel={t.whatsappOn} offLabel={t.whatsappOff} />}
    </div>
  );
}

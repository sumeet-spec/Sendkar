import { formatCurrency } from "@/lib/dashboardMetrics";
import type { InboxUi } from "@/lib/i18n/inboxCopy";

interface PaymentLink {
  id: string;
  provider: string;
  amount: number;
  url: string;
  created_at: string;
  paid_at: string | null;
  status?: string;
  failure_reason?: string | null;
}

export function PaymentsPanel({ t, links, currency = "INR" }: { t: InboxUi; links: PaymentLink[]; currency?: string }) {
  if (links.length === 0) {
    return (
      <div className="sk-card p-4">
        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{t.paymentLinks}</div>
        <p className="text-[12.5px] text-faint">{t.noLinks}</p>
      </div>
    );
  }

  return (
    <div className="sk-card flex flex-col gap-3 p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">{t.paymentLinks}</div>
      <div className="flex max-h-32 flex-col gap-2 overflow-y-auto">
        {links.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-md bg-surface-2 p-2.5 text-[12.5px]">
            <div>
              <span className="font-medium">{formatCurrency(Number(l.amount), currency)}</span>
              <span className="ml-1.5 text-faint capitalize">{l.provider}</span>
            </div>
            {l.paid_at ? (
              <span className="sk-pill border-accent text-accent">{t.paid}</span>
            ) : l.status === "failed" ? (
              <span className="sk-pill border-danger text-danger" title={l.failure_reason ?? undefined}>
                {t.failed}
              </span>
            ) : (
              <a href={l.url} target="_blank" rel="noreferrer" className="sk-pill text-faint hover:text-accent">
                {t.pending}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

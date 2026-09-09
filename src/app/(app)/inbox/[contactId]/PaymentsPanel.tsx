import { formatCurrency } from "@/lib/dashboardMetrics";

interface PaymentLink {
  id: string;
  provider: string;
  amount: number;
  url: string;
  created_at: string;
  paid_at: string | null;
}

export function PaymentsPanel({ links, currency = "USD" }: { links: PaymentLink[]; currency?: string }) {
  if (links.length === 0) {
    return (
      <div className="sk-card p-4">
        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Payment links</div>
        <p className="text-[12.5px] text-faint">No payment links yet — send one from the reply box below.</p>
      </div>
    );
  }

  return (
    <div className="sk-card flex flex-col gap-3 p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">Payment links</div>
      <div className="flex max-h-32 flex-col gap-2 overflow-y-auto">
        {links.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-md bg-surface-2 p-2.5 text-[12.5px]">
            <div>
              <span className="font-medium">{formatCurrency(Number(l.amount), currency)}</span>
              <span className="ml-1.5 text-faint capitalize">{l.provider}</span>
            </div>
            {l.paid_at ? (
              <span className="sk-pill border-accent text-accent">Paid</span>
            ) : (
              <a href={l.url} target="_blank" rel="noreferrer" className="sk-pill text-faint hover:text-accent">
                Pending ↗
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

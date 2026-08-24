// Pure calculation helpers behind the dashboard — split out of
// dashboard/page.tsx (an async Server Component that can't be unit tested
// directly) so the actual math is covered without needing a database or a
// login.

export const DAY_MS = 24 * 60 * 60 * 1000;
export const MESSAGING_TIERS = [250, 1000, 10000, 100000];

export interface RecipientStatusRow {
  status: string;
}

export interface DeliveryStats {
  total: number;
  delivered: number;
  failed: number;
  concluded: number;
  deliveryRate: number | null;
}

export function computeDeliveryStats(rows: RecipientStatusRow[]): DeliveryStats {
  const total = rows.length;
  const delivered = rows.filter((r) => r.status === "delivered" || r.status === "read").length;
  const failed = rows.filter((r) => r.status === "failed").length;
  // Out of recipients actually sent to so far, not the whole audience —
  // counting still-queued ones in the denominator understates the rate for
  // any campaign the cron hasn't finished working through yet.
  const concluded = rows.filter((r) => r.status !== "queued").length;
  const deliveryRate = concluded > 0 ? Math.round((delivered / concluded) * 100) : null;
  return { total, delivered, failed, concluded, deliveryRate };
}

/** Day-bucketed counts for the trailing N days (oldest first), from a list of ISO timestamps. */
export function bucketMessagesByDay(createdAts: string[], now: number, days = 7): number[] {
  const dayKeys = Array.from({ length: days }, (_, i) => new Date(now - (days - 1 - i) * DAY_MS).toISOString().slice(0, 10));
  const countsByDay = new Map(dayKeys.map((d) => [d, 0]));
  for (const createdAt of createdAts) {
    const key = new Date(createdAt).toISOString().slice(0, 10);
    if (countsByDay.has(key)) countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }
  return dayKeys.map((d) => countsByDay.get(d) ?? 0);
}

/** A value series as an SVG polyline point string, oldest first. */
export function sparklinePoints(values: number[], width: number, height: number): string {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  return values.map((v, i) => `${(i * stepX).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`).join(" ");
}

export interface OrderRow {
  total_amount: number | string;
  attributed_campaign_id: string | null;
  created_at: string;
}

export interface RevenueTrend {
  revenue30d: number;
  attributedRevenue30d: number;
  revenuePrev30d: number;
  revenueTrendPct: number | null;
}

/**
 * Revenue scoped to the trailing 30 days, compared against the 30 days
 * before that — a hero number needs a real baseline to read a trend
 * against, not a lifetime total with nothing to compare it to.
 */
export function computeRevenueTrend(orders: OrderRow[], now: number): RevenueTrend {
  const currentWindowStart = now - 30 * DAY_MS;
  const previousWindowStart = now - 60 * DAY_MS;
  let revenue30d = 0;
  let attributedRevenue30d = 0;
  let revenuePrev30d = 0;
  for (const o of orders) {
    const t = new Date(o.created_at).getTime();
    const amount = Number(o.total_amount);
    if (t >= currentWindowStart) {
      revenue30d += amount;
      if (o.attributed_campaign_id) attributedRevenue30d += amount;
    } else if (t >= previousWindowStart) {
      revenuePrev30d += amount;
    }
  }
  const revenueTrendPct = revenuePrev30d > 0 ? Math.round(((revenue30d - revenuePrev30d) / revenuePrev30d) * 100) : null;
  return { revenue30d, attributedRevenue30d, revenuePrev30d, revenueTrendPct };
}

export interface TopCustomerOrderRow {
  contact_id: string | null;
  total_amount: number | string;
  contacts: { phone?: string | null; name?: string | null } | null;
}

export interface TopCustomer {
  contactId: string;
  phone: string;
  name: string | null;
  spend: number;
}

/** Top spenders by lifetime value, not windowed — who has spent the most overall. */
export function groupTopCustomers(orders: TopCustomerOrderRow[], limit = 5): TopCustomer[] {
  const spendByContact = new Map<string, TopCustomer>();
  for (const o of orders) {
    if (!o.contact_id) continue;
    const bucket = spendByContact.get(o.contact_id) ?? { contactId: o.contact_id, phone: o.contacts?.phone ?? "—", name: o.contacts?.name ?? null, spend: 0 };
    bucket.spend += Number(o.total_amount);
    spendByContact.set(o.contact_id, bucket);
  }
  return Array.from(spendByContact.values()).sort((a, b) => b.spend - a.spend).slice(0, limit);
}

/** First letter of a display name, for an avatar badge — null when there's no name to draw from. */
export function initial(name: string | null): string | null {
  return (name?.trim()?.[0] ?? "").toUpperCase() || null;
}

/** How full today's messaging-tier cap is, 0–100. */
export function messagingTierFillPct(dailySendCount: number, tier: number): number {
  return Math.min(100, Math.round((dailySendCount / Math.max(1, tier)) * 100));
}

/** Which tier ladder rung a workspace's current cap matches, defaulting to the first rung. */
export function messagingTierIndex(tier: number, tiers: readonly number[] = MESSAGING_TIERS): number {
  return Math.max(0, tiers.indexOf(tier));
}

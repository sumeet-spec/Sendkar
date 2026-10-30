/**
 * Finds the things a customer buys on a rhythm (a monthly sack of rice, a refill every six weeks) and says when
 * they are due again. Pure, so the timing rules are tested without a database.
 */

export interface ReorderBill { created_at: string; items: Array<{ name?: string }> | null }

export interface ReorderCandidate {
  name: string;
  purchases: number;
  avgGapDays: number;
  lastBoughtAt: string;
  daysSinceLast: number;
}

const DAY = 86_400_000;
export const MIN_PURCHASES = 3;
export const MIN_GAP_DAYS = 7;
export const MAX_GAP_DAYS = 120;

const key = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * An item is "due" when the customer has bought it at least three times, the average gap between purchases is a
 * week to four months, and now is close to or past the usual gap (but not so long past that they have stopped).
 */
export function reorderCandidates(bills: ReorderBill[], now: Date): ReorderCandidate[] {
  const byItem = new Map<string, { name: string; times: number[] }>();
  for (const b of bills) {
    const t = new Date(b.created_at).getTime();
    for (const it of b.items ?? []) {
      const name = (it.name ?? "").trim();
      if (!name) continue;
      const k = key(name);
      const entry = byItem.get(k) ?? { name, times: [] };
      // The same item twice on one bill counts once.
      if (!entry.times.includes(t)) entry.times.push(t);
      byItem.set(k, entry);
    }
  }

  const out: ReorderCandidate[] = [];
  for (const { name, times } of byItem.values()) {
    if (times.length < MIN_PURCHASES) continue;
    times.sort((a, b) => a - b);
    const last = times[times.length - 1];
    const avgGapDays = (last - times[0]) / DAY / (times.length - 1);
    if (avgGapDays < MIN_GAP_DAYS || avgGapDays > MAX_GAP_DAYS) continue;
    const daysSinceLast = (now.getTime() - last) / DAY;
    if (daysSinceLast >= avgGapDays * 0.9 && daysSinceLast <= avgGapDays * 2.5) {
      out.push({ name, purchases: times.length, avgGapDays: Math.round(avgGapDays), lastBoughtAt: new Date(last).toISOString(), daysSinceLast: Math.round(daysSinceLast) });
    }
  }
  // The most regular habit first.
  return out.sort((a, b) => b.purchases - a.purchases);
}

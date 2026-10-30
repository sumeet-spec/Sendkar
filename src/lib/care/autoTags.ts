/**
 * Tags the system works out from what a customer does, so a shop can message "my regulars" or "people who have
 * not been in for two months" without setting anything up. Pure, so every rule is tested without a database.
 */

export type AutoTag = "new" | "regular" | "big_spender" | "lapsed" | "owes" | "over_limit";

export const AUTO_TAGS: AutoTag[] = ["new", "regular", "big_spender", "lapsed", "owes", "over_limit"];

export interface TagBill { amount: number | string; paid: boolean; created_at: string }

export interface TagInput {
  bills: TagBill[];
  creditLimit: number | null;
  now: Date;
  /** Total billed at or above this counts as a big spender. Infinity means nobody does yet. */
  bigSpenderFrom: number;
}

const DAY = 86_400_000;
export const LAPSED_AFTER_DAYS = 60;
export const NEW_WITHIN_DAYS = 14;
export const REGULAR_MIN_BILLS = 3;
export const REGULAR_MAX_AVG_GAP_DAYS = 45;

export function computeAutoTags(i: TagInput): AutoTag[] {
  if (i.bills.length === 0) return [];
  const times = i.bills.map((b) => new Date(b.created_at).getTime()).sort((a, b) => a - b);
  const last = times[times.length - 1];
  const first = times[0];
  const sinceLast = (i.now.getTime() - last) / DAY;
  const tags: AutoTag[] = [];

  if ((i.now.getTime() - first) / DAY <= NEW_WITHIN_DAYS && i.bills.length <= 2) tags.push("new");

  if (i.bills.length >= REGULAR_MIN_BILLS) {
    const avgGap = (last - first) / DAY / (times.length - 1);
    if (avgGap <= REGULAR_MAX_AVG_GAP_DAYS && sinceLast <= LAPSED_AFTER_DAYS) tags.push("regular");
  }

  const total = i.bills.reduce((s, b) => s + Number(b.amount), 0);
  if (total >= i.bigSpenderFrom) tags.push("big_spender");

  if (sinceLast > LAPSED_AFTER_DAYS) tags.push("lapsed");

  const owed = i.bills.filter((b) => !b.paid).reduce((s, b) => s + Number(b.amount), 0);
  if (owed > 0) tags.push("owes");
  if (i.creditLimit !== null && owed > i.creditLimit) tags.push("over_limit");
  return tags;
}

/**
 * The amount a customer's total billed must reach to count as a big spender: the top tenth of this shop's customers.
 * With fewer than ten customers there is no meaningful "top", so nobody is tagged yet.
 */
export function bigSpenderThreshold(totals: number[]): number {
  const t = totals.filter((n) => n > 0).sort((a, b) => b - a);
  if (t.length < 10) return Infinity;
  return t[Math.ceil(t.length / 10) - 1];
}

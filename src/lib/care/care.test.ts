import { describe, it, expect } from "vitest";
import { computeAutoTags, bigSpenderThreshold } from "./autoTags";
import { reorderCandidates } from "./reorder";
import { isOccasionToday, monthDay } from "./dates";

const now = new Date("2026-10-30T10:00:00Z");
const ago = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
const bill = (days: number, amount = 500, paid = true) => ({ amount, paid, created_at: ago(days) });

describe("computeAutoTags", () => {
  const base = { creditLimit: null, now, bigSpenderFrom: Infinity };
  it("tags nothing for someone who has never been billed", () => {
    expect(computeAutoTags({ ...base, bills: [] })).toEqual([]);
  });
  it("marks a first-time buyer as new", () => {
    expect(computeAutoTags({ ...base, bills: [bill(3)] })).toEqual(["new"]);
  });
  it("marks someone who buys every few weeks as regular", () => {
    expect(computeAutoTags({ ...base, bills: [bill(70), bill(40), bill(10)] })).toContain("regular");
  });
  it("does not call someone regular who buys rarely", () => {
    expect(computeAutoTags({ ...base, bills: [bill(300), bill(150), bill(10)] })).not.toContain("regular");
  });
  it("marks someone not seen for over 60 days as lapsed, and not regular", () => {
    const tags = computeAutoTags({ ...base, bills: [bill(150), bill(120), bill(90)] });
    expect(tags).toContain("lapsed");
    expect(tags).not.toContain("regular");
  });
  it("marks unpaid bills as owes, and over_limit past the credit limit", () => {
    expect(computeAutoTags({ ...base, bills: [bill(10, 800, false)] })).toContain("owes");
    expect(computeAutoTags({ ...base, creditLimit: 500, bills: [bill(10, 800, false)] })).toContain("over_limit");
    expect(computeAutoTags({ ...base, creditLimit: 1000, bills: [bill(10, 800, false)] })).not.toContain("over_limit");
  });
  it("marks the biggest spenders", () => {
    expect(computeAutoTags({ ...base, bigSpenderFrom: 1000, bills: [bill(10, 600), bill(5, 600)] })).toContain("big_spender");
    expect(computeAutoTags({ ...base, bigSpenderFrom: 1000, bills: [bill(10, 300)] })).not.toContain("big_spender");
  });
});

describe("bigSpenderThreshold", () => {
  it("needs ten customers before anyone counts as a top spender", () => {
    expect(bigSpenderThreshold([100, 200, 300])).toBe(Infinity);
  });
  it("is the top tenth", () => {
    const totals = Array.from({ length: 20 }, (_, i) => (i + 1) * 100);
    expect(bigSpenderThreshold(totals)).toBe(1900);
  });
  it("ignores customers with nothing billed", () => {
    expect(bigSpenderThreshold([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500])).toBe(Infinity);
  });
});

describe("reorderCandidates", () => {
  const rice = [{ name: "Basmati rice 5kg" }];
  it("finds an item bought monthly that is due again", () => {
    const c = reorderCandidates([{ created_at: ago(90), items: rice }, { created_at: ago(60), items: rice }, { created_at: ago(30), items: rice }], now);
    expect(c).toHaveLength(1);
    expect(c[0]).toMatchObject({ name: "Basmati rice 5kg", purchases: 3, avgGapDays: 30, daysSinceLast: 30 });
  });
  it("waits while it is not yet time", () => {
    expect(reorderCandidates([{ created_at: ago(80), items: rice }, { created_at: ago(50), items: rice }, { created_at: ago(10), items: rice }], now)).toHaveLength(0);
  });
  it("gives up on an item the customer has clearly stopped buying", () => {
    expect(reorderCandidates([{ created_at: ago(400), items: rice }, { created_at: ago(370), items: rice }, { created_at: ago(340), items: rice }], now)).toHaveLength(0);
  });
  it("needs three purchases, and matches names without caring about case or spacing", () => {
    expect(reorderCandidates([{ created_at: ago(60), items: rice }, { created_at: ago(30), items: rice }], now)).toHaveLength(0);
    const mixed = [{ created_at: ago(90), items: [{ name: "Basmati  Rice 5kg" }] }, { created_at: ago(60), items: [{ name: "basmati rice 5kg" }] }, { created_at: ago(30), items: rice }];
    expect(reorderCandidates(mixed, now)).toHaveLength(1);
  });
  it("handles bills with no items", () => {
    expect(reorderCandidates([{ created_at: ago(5), items: null }, { created_at: ago(2), items: [] }], now)).toEqual([]);
  });
});

describe("occasions", () => {
  it("reads a date and ignores the year", () => {
    expect(monthDay("1990-03-14")).toEqual({ month: 3, day: 14 });
    expect(monthDay("nonsense")).toBeNull();
  });
  it("matches today's day of the year", () => {
    expect(isOccasionToday("1985-10-30", "2026-10-30")).toBe(true);
    expect(isOccasionToday("1985-10-31", "2026-10-30")).toBe(false);
    expect(isOccasionToday(null, "2026-10-30")).toBe(false);
  });
  it("celebrates 29 February on 28 February in a year that has none", () => {
    expect(isOccasionToday("2000-02-29", "2027-02-28")).toBe(true);
    expect(isOccasionToday("2000-02-29", "2028-02-28")).toBe(false);
    expect(isOccasionToday("2000-02-29", "2028-02-29")).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import {
  DAY_MS, MESSAGING_TIERS, computeDeliveryStats, bucketMessagesByDay, sparklinePoints,
  computeRevenueTrend, groupTopCustomers, initial, messagingTierFillPct, messagingTierIndex,
} from "./dashboardMetrics";

describe("computeDeliveryStats", () => {
  it("returns a null rate with no concluded recipients", () => {
    expect(computeDeliveryStats([])).toEqual({ total: 0, delivered: 0, failed: 0, concluded: 0, deliveryRate: null });
    expect(computeDeliveryStats([{ status: "queued" }, { status: "queued" }])).toMatchObject({ deliveryRate: null, concluded: 0 });
  });

  it("counts delivered and read together as delivered", () => {
    const stats = computeDeliveryStats([{ status: "delivered" }, { status: "read" }, { status: "failed" }]);
    expect(stats).toMatchObject({ total: 3, delivered: 2, failed: 1, concluded: 3, deliveryRate: 67 });
  });

  it("excludes still-queued recipients from the rate's denominator", () => {
    // 1 delivered out of 2 concluded (the 3rd is still queued) = 50%, not 33%.
    const stats = computeDeliveryStats([{ status: "delivered" }, { status: "failed" }, { status: "queued" }]);
    expect(stats).toMatchObject({ total: 3, concluded: 2, deliveryRate: 50 });
  });
});

describe("bucketMessagesByDay", () => {
  const now = new Date("2026-08-24T12:00:00Z").getTime();

  it("returns one zero per day when there's no activity", () => {
    expect(bucketMessagesByDay([], now)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("buckets today's messages into the last slot", () => {
    const values = bucketMessagesByDay(["2026-08-24T09:00:00Z", "2026-08-24T10:00:00Z"], now);
    expect(values[6]).toBe(2);
    expect(values.slice(0, 6)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it("buckets a message from 6 days ago into the first slot", () => {
    const sixDaysAgo = new Date(now - 6 * DAY_MS).toISOString();
    const values = bucketMessagesByDay([sixDaysAgo], now);
    expect(values[0]).toBe(1);
    expect(values.slice(1)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it("drops a message older than the window", () => {
    const eightDaysAgo = new Date(now - 8 * DAY_MS).toISOString();
    expect(bucketMessagesByDay([eightDaysAgo], now)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("sparklinePoints", () => {
  it("spaces N values evenly across the given width", () => {
    const points = sparklinePoints([0, 1, 2], 10, 10);
    const xs = points.split(" ").map((p) => Number(p.split(",")[0]));
    expect(xs).toEqual([0, 5, 10]);
  });

  it("does not divide by zero for a single value", () => {
    expect(() => sparklinePoints([5], 64, 26)).not.toThrow();
  });

  it("does not divide by zero when every value is identical", () => {
    const points = sparklinePoints([3, 3, 3], 64, 26);
    expect(points.split(" ")).toHaveLength(3);
  });
});

describe("computeRevenueTrend", () => {
  const now = new Date("2026-08-24T00:00:00Z").getTime();
  const daysAgo = (n: number) => new Date(now - n * DAY_MS).toISOString();

  it("sums orders in the trailing 30 days and splits out the attributed share", () => {
    const orders = [
      { total_amount: 1000, attributed_campaign_id: "camp-1", created_at: daysAgo(5) },
      { total_amount: 500, attributed_campaign_id: null, created_at: daysAgo(10) },
    ];
    const trend = computeRevenueTrend(orders, now);
    expect(trend.revenue30d).toBe(1500);
    expect(trend.attributedRevenue30d).toBe(1000);
  });

  it("excludes orders older than 60 days entirely", () => {
    const orders = [{ total_amount: 999, attributed_campaign_id: null, created_at: daysAgo(90) }];
    const trend = computeRevenueTrend(orders, now);
    expect(trend.revenue30d).toBe(0);
    expect(trend.revenuePrev30d).toBe(0);
  });

  it("computes a percentage trend against the prior 30-day window", () => {
    const orders = [
      { total_amount: 1200, attributed_campaign_id: null, created_at: daysAgo(5) },
      { total_amount: 1000, attributed_campaign_id: null, created_at: daysAgo(45) },
    ];
    expect(computeRevenueTrend(orders, now).revenueTrendPct).toBe(20);
  });

  it("returns a null trend when there's no prior-window baseline to compare against", () => {
    const orders = [{ total_amount: 500, attributed_campaign_id: null, created_at: daysAgo(5) }];
    expect(computeRevenueTrend(orders, now).revenueTrendPct).toBeNull();
  });

  it("handles string amounts from Postgres numeric columns", () => {
    const orders = [{ total_amount: "250.50", attributed_campaign_id: null, created_at: daysAgo(1) }];
    expect(computeRevenueTrend(orders, now).revenue30d).toBe(250.5);
  });
});

describe("groupTopCustomers", () => {
  it("sums spend per contact and sorts descending", () => {
    const orders = [
      { contact_id: "a", total_amount: 100, contacts: { phone: "+91A", name: "Alice" } },
      { contact_id: "b", total_amount: 500, contacts: { phone: "+91B", name: "Bob" } },
      { contact_id: "a", total_amount: 200, contacts: { phone: "+91A", name: "Alice" } },
    ];
    const top = groupTopCustomers(orders);
    expect(top[0]).toMatchObject({ contactId: "b", spend: 500 });
    expect(top[1]).toMatchObject({ contactId: "a", spend: 300 });
  });

  it("skips orders with no linked contact", () => {
    const orders = [{ contact_id: null, total_amount: 999, contacts: null }];
    expect(groupTopCustomers(orders)).toEqual([]);
  });

  it("respects the limit", () => {
    const orders = Array.from({ length: 8 }, (_, i) => ({
      contact_id: `c${i}`, total_amount: i, contacts: { phone: "x", name: null },
    }));
    expect(groupTopCustomers(orders, 5)).toHaveLength(5);
  });
});

describe("initial", () => {
  it("uppercases the first letter of a name", () => {
    expect(initial("priya")).toBe("P");
  });

  it("returns null for no name", () => {
    expect(initial(null)).toBeNull();
    expect(initial("")).toBeNull();
    expect(initial("   ")).toBeNull();
  });
});

describe("messagingTierFillPct", () => {
  it("computes a plain percentage", () => {
    expect(messagingTierFillPct(18, 250)).toBe(7);
  });

  it("caps at 100 even if daily_send_count exceeds the tier", () => {
    expect(messagingTierFillPct(300, 250)).toBe(100);
  });

  it("doesn't divide by zero for a zero tier", () => {
    expect(() => messagingTierFillPct(5, 0)).not.toThrow();
  });
});

describe("messagingTierIndex", () => {
  it("finds the matching rung", () => {
    expect(messagingTierIndex(1000, MESSAGING_TIERS)).toBe(1);
  });

  it("defaults to the first rung for an unrecognized tier", () => {
    expect(messagingTierIndex(999999, MESSAGING_TIERS)).toBe(0);
  });
});

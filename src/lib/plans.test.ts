import { describe, it, expect } from "vitest";
import { PLAN_LIMITS, IMAGES_PER_NUMBER, numberAllowance, imageAllowance, monthStartIst, nextMonthStartIst, allowanceLines, getPlanLimits } from "./plans";

describe("plan limits", () => {
  it("sells packages by number of numbers: none, 1, 5, 10", () => {
    expect(["free", "starter", "growth", "scale"].map((p) => PLAN_LIMITS[p as keyof typeof PLAN_LIMITS].maxWhatsAppNumbers)).toEqual([0, 1, 5, 10]);
  });
  it("gives each number its share of AI images, and free none", () => {
    for (const p of Object.values(PLAN_LIMITS)) expect(p.imagesPerMonth).toBe(p.maxWhatsAppNumbers * IMAGES_PER_NUMBER);
    expect(PLAN_LIMITS.free.imagesPerMonth).toBe(0);
    expect(PLAN_LIMITS.starter.imagesPerMonth).toBe(10);
  });
  it("treats an unknown plan as free, so nothing is unlocked by accident", () => {
    expect(getPlanLimits("mystery").maxWhatsAppNumbers).toBe(0);
  });
});

describe("numberAllowance", () => {
  it("lets a paid plan connect up to its limit", () => {
    expect(numberAllowance("starter", 0).canAdd).toBe(true);
    expect(numberAllowance("starter", 1)).toMatchObject({ canAdd: false, remaining: 0 });
    expect(numberAllowance("growth", 4).canAdd).toBe(true);
    expect(numberAllowance("growth", 5).canAdd).toBe(false);
  });
  it("blocks free from connecting, with a message that points to billing", () => {
    const a = numberAllowance("free", 0);
    expect(a.canAdd).toBe(false);
    expect(a.blockedReason).toMatch(/paid plan/);
  });
  it("names the limit for a paid plan that is full", () => {
    expect(numberAllowance("starter", 1).blockedReason).toMatch(/1 WhatsApp number\./);
    expect(numberAllowance("growth", 5).blockedReason).toMatch(/5 WhatsApp numbers/);
  });
  it("never disconnects a workspace that is already over its limit, it only blocks adding more", () => {
    const over = numberAllowance("free", 1);
    expect(over.remaining).toBe(0);
    expect(over.canAdd).toBe(false);
  });
});

describe("imageAllowance", () => {
  it("counts down and stops at the limit", () => {
    expect(imageAllowance("starter", 3)).toMatchObject({ limit: 10, used: 3, remaining: 7, exhausted: false, blockedReason: null });
    expect(imageAllowance("starter", 10).exhausted).toBe(true);
    expect(imageAllowance("starter", 99).remaining).toBe(0);
  });
  it("gives free no images and explains why", () => {
    expect(imageAllowance("free", 0)).toMatchObject({ limit: 0, exhausted: true });
    expect(imageAllowance("free", 0).blockedReason).toMatch(/paid plans/);
  });
  it("tells a paid customer when it resets", () => expect(imageAllowance("growth", 50).blockedReason).toMatch(/reset on the 1st/));
});

describe("month boundaries use the Indian calendar", () => {
  it("starts the month at 00:00 IST on the 1st", () => {
    expect(monthStartIst(new Date("2026-11-15T10:00:00Z")).toISOString()).toBe("2026-10-31T18:30:00.000Z");
  });
  it("counts the last evening of a month in UTC as already the next month in India", () => {
    // 20:00 UTC on 31 Oct is 01:30 IST on 1 Nov.
    expect(monthStartIst(new Date("2026-10-31T20:00:00Z")).toISOString()).toBe("2026-10-31T18:30:00.000Z");
  });
  it("resets at the start of next month, including across a year end", () => {
    expect(nextMonthStartIst(new Date("2026-11-15T10:00:00Z")).toISOString()).toBe("2026-11-30T18:30:00.000Z");
    expect(nextMonthStartIst(new Date("2026-12-15T10:00:00Z")).toISOString()).toBe("2026-12-31T18:30:00.000Z");
  });
});

describe("allowanceLines", () => {
  it("describes each plan from the limits, so pricing copy cannot drift", () => {
    expect(allowanceLines("starter")).toEqual(["1 WhatsApp number", "10 AI images a month"]);
    expect(allowanceLines("growth")).toEqual(["Up to 5 WhatsApp numbers", "50 AI images a month"]);
    expect(allowanceLines("free")).toEqual(["No WhatsApp number — upgrade to connect one"]);
  });
});

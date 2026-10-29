import { describe, it, expect } from "vitest";
import {
  PLAN_LIMITS, IMAGES_PER_NUMBER, TRIAL_DAYS, TRIAL_IMAGES, IMAGE_PACKS,
  numberAllowance, imageAllowance, monthStartIst, nextMonthStartIst, allowanceLines, getPlanLimits,
  effectivePlan, trialDaysLeft, trialExpired, workspaceCanSend, canSendWithPlan, planLabel, findImagePack,
} from "./plans";

describe("plan limits", () => {
  it("sells packages by number of numbers: none, 1, 5, 10", () => {
    expect(["free", "starter", "growth", "scale"].map((p) => PLAN_LIMITS[p as keyof typeof PLAN_LIMITS].maxWhatsAppNumbers)).toEqual([0, 1, 5, 10]);
  });
  it("gives each paid number its share of AI images, and no plan none", () => {
    for (const p of ["free", "starter", "growth", "scale"] as const) {
      expect(PLAN_LIMITS[p].imagesPerMonth).toBe(PLAN_LIMITS[p].maxWhatsAppNumbers * IMAGES_PER_NUMBER);
    }
    expect(PLAN_LIMITS.free.imagesPerMonth).toBe(0);
    expect(PLAN_LIMITS.starter.imagesPerMonth).toBe(10);
  });
  it("treats an unknown plan as no plan, so nothing is unlocked by accident", () => {
    expect(getPlanLimits("mystery").maxWhatsAppNumbers).toBe(0);
  });
  it("lets the trial try everything on one number with a small image taste", () => {
    const t = PLAN_LIMITS.trial;
    expect(t.maxWhatsAppNumbers).toBe(1);
    expect(t.imagesPerMonth).toBe(TRIAL_IMAGES);
    expect([t.automationsEnabled, t.aiAgentEnabled, t.catalogEnabled, t.instagramEnabled, t.outboundWebhooksEnabled]).toEqual([true, true, true, true, true]);
    expect(t.priceInr).toBe(0);
  });
});

describe("the 7-day trial", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  const inDays = (d: number) => new Date(now.getTime() + d * 86_400_000).toISOString();

  it("runs for a week", () => expect(TRIAL_DAYS).toBe(7));
  it("is the trial plan while the clock has not run out", () => {
    expect(effectivePlan({ plan: "trial", trial_ends_at: inDays(3) }, now)).toBe("trial");
  });
  it("becomes no plan the moment it ends, with nothing running to flip it", () => {
    expect(effectivePlan({ plan: "trial", trial_ends_at: inDays(-0.001) }, now)).toBe("free");
    expect(effectivePlan({ plan: "trial", trial_ends_at: inDays(-30) }, now)).toBe("free");
  });
  it("treats a trial with no end date as ended rather than endless", () => {
    expect(effectivePlan({ plan: "trial", trial_ends_at: null }, now)).toBe("free");
    expect(effectivePlan({ plan: "trial" }, now)).toBe("free");
  });
  it("leaves a paid plan alone, even if an old trial date is still on the row", () => {
    expect(effectivePlan({ plan: "growth", trial_ends_at: inDays(-10) }, now)).toBe("growth");
  });
  it("counts days left, rounding a partial day up", () => {
    expect(trialDaysLeft({ plan: "trial", trial_ends_at: inDays(7) }, now)).toBe(7);
    expect(trialDaysLeft({ plan: "trial", trial_ends_at: inDays(0.2) }, now)).toBe(1);
    expect(trialDaysLeft({ plan: "trial", trial_ends_at: inDays(-1) }, now)).toBe(0);
    expect(trialDaysLeft({ plan: "starter", trial_ends_at: inDays(5) }, now)).toBeNull();
  });
  it("reports an ended trial as expired, and nothing else", () => {
    expect(trialExpired({ plan: "trial", trial_ends_at: inDays(-1) }, now)).toBe(true);
    expect(trialExpired({ plan: "trial", trial_ends_at: inDays(1) }, now)).toBe(false);
    expect(trialExpired({ plan: "free" }, now)).toBe(false);
  });
  it("allows sending on an active trial and any paid plan, never with no plan", () => {
    expect(workspaceCanSend({ plan: "trial", trial_ends_at: inDays(2) }, now)).toBe(true);
    expect(workspaceCanSend({ plan: "trial", trial_ends_at: inDays(-2) }, now)).toBe(false);
    expect(workspaceCanSend({ plan: "free" }, now)).toBe(false);
    for (const p of ["starter", "growth", "scale"]) expect(workspaceCanSend({ plan: p }, now)).toBe(true);
    expect(canSendWithPlan("mystery")).toBe(false);
  });
  it("names plans for people", () => {
    expect(planLabel("trial")).toBe("free trial");
    expect(planLabel("free")).toBe("no active plan");
    expect(planLabel("growth")).toBe("growth");
  });
});

describe("numberAllowance", () => {
  it("lets a paid plan connect up to its limit", () => {
    expect(numberAllowance("starter", 0).canAdd).toBe(true);
    expect(numberAllowance("starter", 1)).toMatchObject({ canAdd: false, remaining: 0 });
    expect(numberAllowance("growth", 4).canAdd).toBe(true);
    expect(numberAllowance("growth", 5).canAdd).toBe(false);
  });
  it("lets a trial connect one number", () => {
    expect(numberAllowance("trial", 0).canAdd).toBe(true);
    expect(numberAllowance("trial", 1).canAdd).toBe(false);
  });
  it("blocks no plan from connecting, with a message that points to billing", () => {
    const a = numberAllowance("free", 0);
    expect(a.canAdd).toBe(false);
    expect(a.blockedReason).toMatch(/active plan/);
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
  it("gives no plan no images and explains why", () => {
    expect(imageAllowance("free", 0)).toMatchObject({ limit: 0, exhausted: true });
    expect(imageAllowance("free", 0).blockedReason).toMatch(/active plan/);
  });
  it("tells a paid customer when it resets, and that a pack gets them going now", () => {
    const msg = imageAllowance("growth", 50).blockedReason;
    expect(msg).toMatch(/reset on the 1st/);
    expect(msg).toMatch(/image pack/);
  });
  it("adds bought packs on top of what is left this month", () => {
    expect(imageAllowance("starter", 4, 20)).toMatchObject({ remaining: 26, packBalance: 20, exhausted: false });
  });
  it("keeps going on a pack after the monthly allowance is gone", () => {
    expect(imageAllowance("starter", 10, 5)).toMatchObject({ remaining: 5, exhausted: false, blockedReason: null });
    expect(imageAllowance("starter", 99, 0).exhausted).toBe(true);
  });
  it("lets a pack buyer on no plan still use what they bought", () => {
    expect(imageAllowance("free", 0, 7)).toMatchObject({ remaining: 7, exhausted: false });
  });
  it("ignores a negative pack balance", () => expect(imageAllowance("starter", 0, -5).remaining).toBe(10));
});

describe("image packs", () => {
  it("are priced above their cost and get cheaper per image as they grow", () => {
    const perImage = IMAGE_PACKS.map((p) => p.priceInr / p.images);
    for (const price of perImage) expect(price).toBeGreaterThan(8); // generation costs about 3.5, more with retries
    expect(perImage).toEqual([...perImage].sort((a, b) => b - a));
  });
  it("have unique keys and env vars, and can be found by key", () => {
    expect(new Set(IMAGE_PACKS.map((p) => p.key)).size).toBe(IMAGE_PACKS.length);
    expect(new Set(IMAGE_PACKS.map((p) => p.envVar)).size).toBe(IMAGE_PACKS.length);
    expect(findImagePack("images_30")?.images).toBe(30);
    expect(findImagePack("nope")).toBeUndefined();
  });
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
    expect(allowanceLines("free")).toEqual(["No WhatsApp number — choose a plan to connect one"]);
    expect(allowanceLines("trial")).toEqual(["1 WhatsApp number", "5 AI images", "Everything unlocked for 7 days"]);
  });
});

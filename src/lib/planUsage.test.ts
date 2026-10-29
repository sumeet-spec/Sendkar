import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { countConnectedNumbers, checkCanConnectNumber, getImageUsage, getImageAllowance } from "./planUsage";

interface FakeData {
  numbers?: number;
  /** Rows in ai_image_usage: drawn from the monthly allowance, and from packs. */
  usage?: { monthly: number; pack: number } | "error";
  /** The `images` of each row in image_pack_purchases. */
  purchases?: number[] | "error";
}

// A stand-in client: it answers each query from FakeData and records the date filter it was given.
function fakeDb(data: FakeData, seenFilters?: Array<[string, unknown]>) {
  return {
    from: (table: string) => {
      const filters: Record<string, unknown> = {};
      const q: Record<string, unknown> = {};
      q.select = () => q;
      q.eq = (col: string, value: unknown) => { filters[col] = value; return q; };
      q.gte = (col: string, value: unknown) => { seenFilters?.push([col, value]); return q; };
      q.then = (res: (v: unknown) => unknown) => {
        let result: unknown;
        if (table === "whatsapp_numbers") result = { count: data.numbers ?? 0, error: null };
        else if (table === "ai_image_usage") {
          result = data.usage === "error"
            ? { count: null, error: { message: "boom" } }
            : { count: filters.from_pack === true ? (data.usage?.pack ?? 0) : (data.usage?.monthly ?? 0), error: null };
        } else if (table === "image_pack_purchases") {
          result = data.purchases === "error"
            ? { data: null, error: { message: "boom" } }
            : { data: (data.purchases ?? []).map((images) => ({ images })), error: null };
        } else result = { count: 0, data: [], error: null };
        return Promise.resolve(result).then(res);
      };
      return q;
    },
  } as unknown as SupabaseClient;
}

const ws = (over: Partial<{ plan: string; whatsapp_phone_number_id: string | null; trial_ends_at: string | null }> = {}) => ({
  id: "w1", plan: "starter", whatsapp_phone_number_id: null as string | null, ...over,
});
const future = new Date(Date.now() + 3 * 86_400_000).toISOString();
const past = new Date(Date.now() - 3 * 86_400_000).toISOString();

describe("countConnectedNumbers", () => {
  it("counts the default number plus extras", async () => {
    expect(await countConnectedNumbers(fakeDb({ numbers: 2 }), ws({ whatsapp_phone_number_id: "123" }))).toBe(3);
    expect(await countConnectedNumbers(fakeDb({ numbers: 2 }), ws())).toBe(2);
    expect(await countConnectedNumbers(fakeDb({}), ws())).toBe(0);
  });
});

describe("checkCanConnectNumber", () => {
  it("lets a starter workspace connect its first number", async () => {
    expect(await checkCanConnectNumber(fakeDb({ numbers: 0 }), ws(), { replacingDefault: true })).toEqual({ ok: true });
  });
  it("blocks a second number on starter, naming the limit", async () => {
    const r = await checkCanConnectNumber(fakeDb({ numbers: 0 }), ws({ whatsapp_phone_number_id: "123" }), { replacingDefault: false });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toMatch(/1 WhatsApp number\./);
  });
  it("always allows swapping the number that is already connected", async () => {
    expect(await checkCanConnectNumber(fakeDb({}), ws({ plan: "free", whatsapp_phone_number_id: "123" }), { replacingDefault: true })).toEqual({ ok: true });
  });
  it("blocks a workspace with no plan from connecting anything new", async () => {
    const r = await checkCanConnectNumber(fakeDb({}), ws({ plan: "free" }), { replacingDefault: true });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toMatch(/active plan/);
  });
  it("lets an active trial connect one number", async () => {
    expect((await checkCanConnectNumber(fakeDb({}), ws({ plan: "trial", trial_ends_at: future }), { replacingDefault: true })).ok).toBe(true);
  });
  it("blocks a trial that has ended, even though the row still says trial", async () => {
    const r = await checkCanConnectNumber(fakeDb({}), ws({ plan: "trial", trial_ends_at: past }), { replacingDefault: true });
    expect(r.ok).toBe(false);
  });
  it("lets growth add numbers up to five in total", async () => {
    expect((await checkCanConnectNumber(fakeDb({ numbers: 3 }), ws({ plan: "growth", whatsapp_phone_number_id: "1" }), { replacingDefault: false })).ok).toBe(true);
    expect((await checkCanConnectNumber(fakeDb({ numbers: 4 }), ws({ plan: "growth", whatsapp_phone_number_id: "1" }), { replacingDefault: false })).ok).toBe(false);
  });
});

describe("getImageUsage", () => {
  it("counts monthly use from the start of the Indian month", async () => {
    const seen: Array<[string, unknown]> = [];
    await getImageUsage(fakeDb({ usage: { monthly: 4, pack: 0 }, purchases: [] }, seen), "w1", new Date("2026-11-15T10:00:00Z"));
    expect(seen[0]).toEqual(["created_at", "2026-10-31T18:30:00.000Z"]);
  });
  it("works out the pack balance as everything bought minus everything drawn from packs", async () => {
    expect(await getImageUsage(fakeDb({ usage: { monthly: 3, pack: 12 }, purchases: [10, 30] }), "w1")).toMatchObject({ monthlyUsed: 3, packBalance: 28, packPurchased: 40, packUsed: 12 });
  });
  it("never reports a negative pack balance", async () => {
    expect((await getImageUsage(fakeDb({ usage: { monthly: 0, pack: 50 }, purchases: [10] }), "w1"))?.packBalance).toBe(0);
  });
  it("returns null, not zero, when anything cannot be read, so callers fail closed", async () => {
    expect(await getImageUsage(fakeDb({ usage: "error", purchases: [] }), "w1")).toBeNull();
    expect(await getImageUsage(fakeDb({ usage: { monthly: 0, pack: 0 }, purchases: "error" }), "w1")).toBeNull();
  });
});

describe("getImageAllowance", () => {
  it("turns usage into an allowance", async () => {
    const a = await getImageAllowance(fakeDb({ usage: { monthly: 8, pack: 0 }, purchases: [] }), { id: "w1", plan: "starter" });
    expect(a).toMatchObject({ limit: 10, used: 8, remaining: 2, exhausted: false });
  });
  it("lets a packs buyer keep going after the month's allowance is gone", async () => {
    const a = await getImageAllowance(fakeDb({ usage: { monthly: 10, pack: 2 }, purchases: [10] }), { id: "w1", plan: "starter" });
    expect(a).toMatchObject({ remaining: 8, packBalance: 8, exhausted: false });
  });
  it("applies the trial's small allowance, and none once it has ended", async () => {
    expect((await getImageAllowance(fakeDb({ usage: { monthly: 0, pack: 0 }, purchases: [] }), { id: "w1", plan: "trial", trial_ends_at: future }))?.limit).toBe(5);
    expect((await getImageAllowance(fakeDb({ usage: { monthly: 0, pack: 0 }, purchases: [] }), { id: "w1", plan: "trial", trial_ends_at: past }))?.limit).toBe(0);
  });
  it("returns null when usage cannot be read", async () => {
    expect(await getImageAllowance(fakeDb({ usage: "error", purchases: [] }), { id: "w1", plan: "growth" })).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { countConnectedNumbers, checkCanConnectNumber, countImagesThisMonth, getImageAllowance } from "./planUsage";

// A stand-in client: every count query resolves to the number (or error) given for that table.
function fakeDb(counts: Record<string, number | "error">, seenFilters?: Array<[string, unknown]>) {
  return {
    from: (table: string) => {
      const q: Record<string, unknown> = {};
      q.select = () => q;
      q.eq = () => q;
      q.gte = (col: string, value: unknown) => { seenFilters?.push([col, value]); return q; };
      q.then = (res: (v: unknown) => unknown) => {
        const c = counts[table];
        return Promise.resolve(c === "error" ? { count: null, error: { message: "boom" } } : { count: c ?? 0, error: null }).then(res);
      };
      return q;
    },
  } as unknown as SupabaseClient;
}

const ws = (over: Partial<{ plan: string; whatsapp_phone_number_id: string | null }> = {}) => ({
  id: "w1", plan: "starter", whatsapp_phone_number_id: null as string | null, ...over,
});

describe("countConnectedNumbers", () => {
  it("counts the default number plus extras", async () => {
    expect(await countConnectedNumbers(fakeDb({ whatsapp_numbers: 2 }), ws({ whatsapp_phone_number_id: "123" }))).toBe(3);
    expect(await countConnectedNumbers(fakeDb({ whatsapp_numbers: 2 }), ws())).toBe(2);
    expect(await countConnectedNumbers(fakeDb({}), ws())).toBe(0);
  });
});

describe("checkCanConnectNumber", () => {
  it("lets a starter workspace connect its first number", async () => {
    expect(await checkCanConnectNumber(fakeDb({ whatsapp_numbers: 0 }), ws(), { replacingDefault: true })).toEqual({ ok: true });
  });
  it("blocks a second number on starter, naming the limit", async () => {
    const r = await checkCanConnectNumber(fakeDb({ whatsapp_numbers: 0 }), ws({ whatsapp_phone_number_id: "123" }), { replacingDefault: false });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toMatch(/1 WhatsApp number\./);
  });
  it("always allows swapping the number that is already connected", async () => {
    // even on free, and even when over the limit: nothing is added
    expect(await checkCanConnectNumber(fakeDb({}), ws({ plan: "free", whatsapp_phone_number_id: "123" }), { replacingDefault: true })).toEqual({ ok: true });
  });
  it("blocks free from connecting anything new", async () => {
    const r = await checkCanConnectNumber(fakeDb({}), ws({ plan: "free" }), { replacingDefault: true });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toMatch(/paid plan/);
  });
  it("lets growth add numbers up to five in total", async () => {
    expect((await checkCanConnectNumber(fakeDb({ whatsapp_numbers: 3 }), ws({ plan: "growth", whatsapp_phone_number_id: "1" }), { replacingDefault: false })).ok).toBe(true);
    expect((await checkCanConnectNumber(fakeDb({ whatsapp_numbers: 4 }), ws({ plan: "growth", whatsapp_phone_number_id: "1" }), { replacingDefault: false })).ok).toBe(false);
  });
});

describe("image usage", () => {
  it("counts from the start of the Indian month", async () => {
    const seen: Array<[string, unknown]> = [];
    await countImagesThisMonth(fakeDb({ ai_image_usage: 4 }, seen), "w1", new Date("2026-11-15T10:00:00Z"));
    expect(seen).toEqual([["created_at", "2026-10-31T18:30:00.000Z"]]);
  });
  it("returns null, not zero, when usage cannot be read, so callers fail closed", async () => {
    expect(await countImagesThisMonth(fakeDb({ ai_image_usage: "error" }), "w1")).toBeNull();
    expect(await getImageAllowance(fakeDb({ ai_image_usage: "error" }), { id: "w1", plan: "growth" })).toBeNull();
  });
  it("turns usage into an allowance", async () => {
    const a = await getImageAllowance(fakeDb({ ai_image_usage: 8 }), { id: "w1", plan: "starter" });
    expect(a).toMatchObject({ limit: 10, used: 8, remaining: 2, exhausted: false });
  });
});

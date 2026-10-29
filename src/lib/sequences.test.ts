import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { interpolate, buildOrderContext, enrollOnOrderPlaced } from "./sequences";

describe("interpolate", () => {
  it("replaces known placeholders", () => {
    expect(interpolate("Still want this? {{checkout_url}}", { checkout_url: "https://x.co/c" })).toBe(
      "Still want this? https://x.co/c",
    );
  });

  it("replaces multiple distinct placeholders", () => {
    expect(interpolate("{{amount}} for {{name}}", { amount: "₹4,200", name: "Priya" })).toBe("₹4,200 for Priya");
  });

  it("leaves unknown placeholders blank rather than throwing", () => {
    expect(interpolate("Hi {{missing}}!", {})).toBe("Hi !");
  });

  it("passes through text with no placeholders unchanged", () => {
    expect(interpolate("plain text", { amount: 1 })).toBe("plain text");
  });
});

describe("buildOrderContext", () => {
  it("formats the amount the Indian way and keeps the raw number", () => {
    expect(buildOrderContext({ amount: 125000, orderLabel: " INV-88 " })).toEqual({ amount: 125000, amount_display: "1,25,000", bill: "INV-88" });
  });
  it("leaves the bill blank when there is none", () => {
    expect(buildOrderContext({ amount: 500 }).bill).toBe("");
  });
});

// A tiny stand-in for the Supabase client: every query resolves from `tables`, every upsert is recorded.
function fakeAdmin(tables: Record<string, unknown[]>, upserts: Array<Record<string, unknown>>, failOn?: string) {
  const chain = (table: string) => {
    const result = () => (failOn === table ? Promise.reject(new Error("db down")) : Promise.resolve({ data: tables[table] ?? [] }));
    const q: Record<string, unknown> = {};
    for (const m of ["select", "eq", "order", "limit"]) q[m] = () => q;
    q.maybeSingle = () => result().then((r) => ({ data: (r.data as unknown[])[0] ?? null }));
    q.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => result().then(res, rej);
    q.upsert = (row: Record<string, unknown>) => { upserts.push(row); return Promise.resolve({ error: null }); };
    return q;
  };
  return { from: chain } as unknown as SupabaseClient;
}

describe("enrollOnOrderPlaced", () => {
  const base = { workspaceId: "w1", contactId: "c1", amount: 4200, orderLabel: "1042" };

  it("enrolls the customer in every active order-placed journey, carrying the sale's details", async () => {
    const upserts: Array<Record<string, unknown>> = [];
    const admin = fakeAdmin({ sequences: [{ id: "s1" }, { id: "s2" }], sequence_steps: [{ delay_minutes: 0 }] }, upserts);
    expect(await enrollOnOrderPlaced(admin, base)).toBe(2);
    expect(upserts.map((u) => u.sequence_id)).toEqual(["s1", "s2"]);
    expect(upserts[0]).toMatchObject({ contact_id: "c1", workspace_id: "w1", status: "active", current_step_order: 0, context: { amount: 4200, amount_display: "4,200", bill: "1042" } });
  });

  it("does nothing when the shop has no such journey", async () => {
    const upserts: Array<Record<string, unknown>> = [];
    expect(await enrollOnOrderPlaced(fakeAdmin({ sequences: [] }, upserts), base)).toBe(0);
    expect(upserts).toEqual([]);
  });

  it("never throws, so logging a sale can't fail because a follow-up couldn't be scheduled", async () => {
    await expect(enrollOnOrderPlaced(fakeAdmin({}, [], "sequences"), base)).resolves.toBe(0);
  });
});

import { describe, it, expect } from "vitest";
import type { createAdminClient } from "@/lib/supabase/admin";
import { workspaceCanSendById } from "./planGate";
import { trialStartFields, effectivePlan, TRIAL_DAYS } from "./plans";
import { imagePackFromMetadata } from "./billing";

type Admin = ReturnType<typeof createAdminClient>;

/** A stand-in admin client that answers the workspace lookup and counts how often it was asked. */
function fakeAdmin(row: { plan: string; trial_ends_at: string | null } | null, opts: { error?: boolean } = {}) {
  let lookups = 0;
  const admin = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            lookups++;
            return opts.error ? { data: null, error: { message: "db down" } } : { data: row, error: null };
          },
        }),
      }),
    }),
  } as unknown as Admin;
  return { admin, lookups: () => lookups };
}

const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

describe("workspaceCanSendById", () => {
  it("allows a paid plan and an active trial", async () => {
    expect(await workspaceCanSendById(fakeAdmin({ plan: "growth", trial_ends_at: null }).admin, "paid-1")).toBe(true);
    expect(await workspaceCanSendById(fakeAdmin({ plan: "trial", trial_ends_at: inDays(3) }).admin, "trial-1")).toBe(true);
  });
  it("blocks a trial that has ended, and a workspace with no plan", async () => {
    expect(await workspaceCanSendById(fakeAdmin({ plan: "trial", trial_ends_at: inDays(-1) }).admin, "ended-1")).toBe(false);
    expect(await workspaceCanSendById(fakeAdmin({ plan: "free", trial_ends_at: null }).admin, "free-1")).toBe(false);
  });
  it("fails open when the workspace cannot be read, so a database hiccup never silences a paying customer", async () => {
    expect(await workspaceCanSendById(fakeAdmin(null, { error: true }).admin, "err-1")).toBe(true);
    expect(await workspaceCanSendById(fakeAdmin(null).admin, "missing-1")).toBe(true);
  });
  it("remembers the answer briefly instead of asking again for every automated reply", async () => {
    const fake = fakeAdmin({ plan: "starter", trial_ends_at: null });
    await workspaceCanSendById(fake.admin, "cached-1");
    await workspaceCanSendById(fake.admin, "cached-1");
    await workspaceCanSendById(fake.admin, "cached-1");
    expect(fake.lookups()).toBe(1);
  });
});

describe("trialStartFields", () => {
  const now = new Date("2026-11-10T09:00:00Z");
  it("starts a trial that ends exactly TRIAL_DAYS later", () => {
    const f = trialStartFields(now);
    expect(f.plan).toBe("trial");
    expect(new Date(f.trial_ends_at).getTime() - now.getTime()).toBe(TRIAL_DAYS * 86_400_000);
  });
  it("is active for the whole week and over the moment it ends", () => {
    const f = trialStartFields(now);
    expect(effectivePlan(f, new Date(now.getTime() + 6.9 * 86_400_000))).toBe("trial");
    expect(effectivePlan(f, new Date(now.getTime() + 7 * 86_400_000 + 1))).toBe("free");
  });
});

describe("imagePackFromMetadata", () => {
  it("recognises a real image-pack purchase and takes the image count from our own table", () => {
    expect(imagePackFromMetadata({ workspace_id: "w1", kind: "image_pack", pack: "images_30", images: "99999" })?.images).toBe(30);
  });
  it("ignores plan purchases, unknown packs and missing metadata", () => {
    expect(imagePackFromMetadata({ workspace_id: "w1", plan: "growth" })).toBeNull();
    expect(imagePackFromMetadata({ kind: "image_pack", pack: "images_9999" })).toBeNull();
    expect(imagePackFromMetadata({ kind: "image_pack" })).toBeNull();
    expect(imagePackFromMetadata(undefined)).toBeNull();
  });
});

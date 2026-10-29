// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {};

function table(name: string) {
  const filters: Array<(r: Row) => boolean> = [];
  let patch: Row | null = null;
  let head = false;
  const rows = () => (db[name] ??= []).filter((r) => filters.every((f) => f(r)));
  const q: Record<string, unknown> = {
    select(_c?: string, o?: { head?: boolean }) { head = Boolean(o?.head); return q; },
    update(p: Row) { patch = p; return q; },
    eq(c: string, v: unknown) { filters.push((r) => r[c] === v); return q; },
    neq(c: string, v: unknown) { filters.push((r) => r[c] !== v); return q; },
    gte(c: string, v: string) { filters.push((r) => String(r[c]) >= v); return q; },
    lt(c: string, v: string) { filters.push((r) => String(r[c]) < v); return q; },
    limit() { return q; },
    single() { return Promise.resolve({ data: rows()[0] ?? null }); },
    maybeSingle() { return Promise.resolve({ data: rows()[0] ?? null }); },
    then(resolve: (v: unknown) => unknown) {
      if (patch) { for (const r of rows()) Object.assign(r, patch); return resolve({ error: null }); }
      return resolve(head ? { count: rows().length, data: null } : { data: rows(), error: null });
    },
  };
  return q;
}

const fakeAdmin = { from: (n: string) => table(n), auth: { admin: { getUserById: async (id: string) => ({ data: { user: { user_metadata: { whatsapp_number: id === "u-nophone" ? undefined : "919876543210" } } } }) } } };
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fakeAdmin }));
const sendMock = vi.fn();
vi.mock("@/lib/whatsapp", () => ({ sendTemplateMessage: (...a: unknown[]) => sendMock(...a) }));

import { gatherSummary, hasNews, isMorningInIndia, sendDailySummaries, yesterdayInIndia } from "./dailySummary";

const NOW = new Date("2026-11-10T03:00:00Z"); // 8:30 AM on 10 Nov in India
const { from, to } = yesterdayInIndia(NOW);
const during = new Date(new Date(from).getTime() + 3_600_000).toISOString();

function seed() {
  db.workspaces = [
    { id: "sys", whatsapp_phone_number_id: "p", whatsapp_access_token: "t", daily_summary: true },
    { id: "w1", plan: "growth", trial_ends_at: null, daily_summary: true, daily_summary_sent_on: null },
  ];
  db.workspace_members = [{ workspace_id: "w1", role: "owner", user_id: "u1" }, { workspace_id: "w2", role: "owner", user_id: "u-nophone" }];
  db.messages = [
    { workspace_id: "w1", direction: "outbound", status: "read", created_at: during },
    { workspace_id: "w1", direction: "outbound", status: "sent", created_at: during },
    { workspace_id: "w1", direction: "inbound", status: "sent", created_at: during },
    { workspace_id: "w1", direction: "outbound", status: "sent", created_at: "2020-01-01T00:00:00Z" },
  ];
  db.contacts = [{ workspace_id: "w1", created_at: during }];
}

beforeEach(() => {
  process.env.DAILY_SUMMARY_WHATSAPP = "true";
  process.env.SYSTEM_SENDER_WORKSPACE_ID = "sys";
  sendMock.mockReset().mockResolvedValue({ metaMessageId: "wamid.1" });
  seed();
});

describe("yesterday in India", () => {
  it("is the previous calendar day, midnight to midnight India time", () => {
    const y = yesterdayInIndia(NOW);
    expect(y.date).toBe("2026-11-09");
    expect(y.today).toBe("2026-11-10");
    expect(y.from).toBe("2026-11-08T18:30:00.000Z");
    expect(y.to).toBe("2026-11-09T18:30:00.000Z");
  });
  it("uses India's date even when it is still the day before in UTC", () => {
    expect(yesterdayInIndia(new Date("2026-11-09T20:00:00Z")).date).toBe("2026-11-09");
  });
});

describe("morning window", () => {
  it("is the 8 AM hour in India only", () => {
    expect(isMorningInIndia(new Date("2026-11-10T03:00:00Z"))).toBe(true);
    expect(isMorningInIndia(new Date("2026-11-10T03:29:00Z"))).toBe(true);
    expect(isMorningInIndia(new Date("2026-11-10T02:29:00Z"))).toBe(false);
    expect(isMorningInIndia(new Date("2026-11-10T04:00:00Z"))).toBe(false);
  });
});

describe("the numbers", () => {
  it("counts only yesterday's messages, replies, reads and new customers", async () => {
    const s = await gatherSummary(fakeAdmin as never, "w1", from, to);
    expect(s).toEqual({ sent: 2, replies: 1, read: 1, newCustomers: 1 });
    expect(hasNews(s)).toBe(true);
    expect(hasNews({ sent: 0, replies: 0, read: 0, newCustomers: 0 })).toBe(false);
  });
});

describe("the morning WhatsApp", () => {
  it("sends the owner the three numbers once, and records the day", async () => {
    expect(await sendDailySummaries(fakeAdmin as never, NOW)).toEqual({ sent: 1, skipped: 0 });
    const call = sendMock.mock.calls[0][0] as { to: string; bodyParams: string[] };
    expect(call.to).toBe("919876543210");
    expect(call.bodyParams).toEqual(["2", "1", "1"]);
    expect(db.workspaces[1].daily_summary_sent_on).toBe("2026-11-10");
    // a second run the same morning sends nothing
    expect(await sendDailySummaries(fakeAdmin as never, NOW)).toEqual({ sent: 0, skipped: 1 });
    expect(sendMock).toHaveBeenCalledTimes(1);
  });
  it("is off until the flag and the system number are set", async () => {
    process.env.DAILY_SUMMARY_WHATSAPP = "false";
    expect(await sendDailySummaries(fakeAdmin as never, NOW)).toEqual({ sent: 0, skipped: 0 });
    expect(sendMock).not.toHaveBeenCalled();
  });
  it("skips an owner who turned it off, and a workspace with no plan", async () => {
    db.workspaces[1].daily_summary = false;
    expect((await sendDailySummaries(fakeAdmin as never, NOW)).sent).toBe(0);
    db.workspaces[1].daily_summary = true;
    db.workspaces[1].plan = "free";
    expect((await sendDailySummaries(fakeAdmin as never, NOW)).sent).toBe(0);
  });
  it("says nothing on a quiet day", async () => {
    db.messages = [];
    db.contacts = [];
    expect(await sendDailySummaries(fakeAdmin as never, NOW)).toEqual({ sent: 0, skipped: 1 });
  });
  it("one failed send does not stop the rest, and is tried again tomorrow", async () => {
    sendMock.mockRejectedValueOnce(new Error("template not approved"));
    expect((await sendDailySummaries(fakeAdmin as never, NOW)).sent).toBe(0);
    expect(db.workspaces[1].daily_summary_sent_on).toBeNull();
  });
});

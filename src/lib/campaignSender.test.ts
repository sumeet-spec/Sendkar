// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.CAMPAIGN_SEND_PAUSE_MS = "0";

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {};

/** Just enough of the Supabase query builder for the sender: eq / neq / or / limit / select / update / insert. */
function table(name: string) {
  const filters: Array<(r: Row) => boolean> = [];
  let patch: Row | null = null;
  let limit = Infinity;
  let wantRows = false;
  const matching = () => (db[name] ?? []).filter((r) => filters.every((f) => f(r))).slice(0, limit);
  const q: Record<string, unknown> = {
    select(_cols?: string) { if (patch) wantRows = true; return q; },
    update(p: Row) { patch = p; return q; },
    insert(p: Row) { (db[name] ??= []).push({ id: `${name}-${(db[name]?.length ?? 0) + 1}`, ...p }); return Promise.resolve({ error: null }); },
    eq(c: string, v: unknown) { filters.push((r) => r[c] === v); return q; },
    neq(c: string, v: unknown) { filters.push((r) => r[c] !== v); return q; },
    or(expr: string) {
      const parts = expr.split(",").map((p) => p.split("."));
      filters.push((r) => parts.some(([col, op, ...rest]) => {
        const val = rest.join(".");
        if (op === "is") return r[col] === null || r[col] === undefined;
        if (op === "lt") return r[col] != null && String(r[col]) < val;
        if (op === "lte") return r[col] != null && String(r[col]) <= val;
        return false;
      }));
      return q;
    },
    limit(n: number) { limit = n; return q; },
    single() { return Promise.resolve({ data: matching()[0] ?? null }); },
    maybeSingle() { return Promise.resolve({ data: matching()[0] ?? null }); },
    then(resolve: (v: unknown) => unknown) {
      if (patch) {
        const rows = matching();
        for (const r of rows) Object.assign(r, patch);
        return resolve({ data: wantRows ? rows.map((r) => ({ id: r.id })) : null, error: null });
      }
      // Join recipients with their contacts, like the real select does.
      const rows = matching().map((r) => (name === "campaign_recipients" ? { ...r, contacts: db.contacts.find((c) => c.id === r.contact_id) } : r));
      return resolve({ data: rows, error: null });
    },
  };
  return q;
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: (n: string) => table(n), auth: { admin: { getUserById: async () => ({ data: { user: null } }) } } }),
}));
const sendMock = vi.fn();
vi.mock("@/lib/whatsapp", () => ({ sendTemplateMessage: (...a: unknown[]) => sendMock(...a) }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/outboundWebhooks", () => ({ dispatchOutboundWebhooks: vi.fn() }));

import { runCampaignSends } from "./campaignSender";

function seed(opts: { recipients: number; tier?: number; badPhoneEvery?: number; optedOutEvery?: number }) {
  db.workspaces = [{
    id: "w1", plan: "growth", trial_ends_at: null, whatsapp_phone_number_id: "p1", whatsapp_access_token: "t",
    messaging_tier: opts.tier ?? 1000, daily_send_count: 0, daily_reset_at: new Date(Date.now() + 3600_000).toISOString(),
  }];
  db.templates = [{ id: "t1", workspace_id: "w1", meta_template_name: "hello", language: "en", body_text: "Hi", header_type: "none", header_image_url: null }];
  db.contacts = Array.from({ length: opts.recipients }, (_, i) => ({
    id: `c${i}`, phone: opts.badPhoneEvery && i % opts.badPhoneEvery === 0 ? null : `9199000${String(i).padStart(5, "0")}`,
    name: `N${i}`, email: null, language: "en", opted_out: Boolean(opts.optedOutEvery && i % opts.optedOutEvery === 1),
  }));
  db.campaign_recipients = db.contacts.map((c, i) => ({ id: `r${i}`, campaign_id: "camp1", contact_id: c.id, status: "queued" }));
  db.campaigns = [{
    id: "camp1", name: "Diwali", status: "sending", template_id: "t1", template_group: null, whatsapp_number_id: null,
    scheduled_at: null, send_lock_until: null, variable_mapping: {}, image_url: null, workspace_id: "w1",
    get workspaces() { return db.workspaces[0]; },
  }];
  db.messages = [];
}

const count = (status: string) => db.campaign_recipients.filter((r) => r.status === status).length;

beforeEach(() => {
  sendMock.mockReset().mockImplementation(async () => ({ metaMessageId: `wamid.${Math.random()}` }));
});

describe("campaign sender", () => {
  it("sends a whole campaign in one run, not 100 a day", async () => {
    seed({ recipients: 250 });
    const res = await runCampaignSends();
    expect(count("sent")).toBe(250);
    expect(count("queued")).toBe(0);
    expect(sendMock).toHaveBeenCalledTimes(250);
    expect(db.campaigns[0].status).toBe("completed");
    expect(db.workspaces[0].daily_send_count).toBe(250);
    expect(res.camp1).toMatch(/completed/);
  });

  it("two runs at once never send to the same person twice", async () => {
    seed({ recipients: 120 });
    await Promise.all([runCampaignSends({ campaignId: "camp1" }), runCampaignSends(), runCampaignSends({ campaignId: "camp1" })]);
    expect(sendMock).toHaveBeenCalledTimes(120);
    const phones = sendMock.mock.calls.map((c) => (c[0] as { to: string }).to);
    expect(new Set(phones).size).toBe(120);
  });

  it("stops at the day's sending limit and keeps the rest queued", async () => {
    seed({ recipients: 150, tier: 40 });
    const res = await runCampaignSends();
    expect(count("sent")).toBe(40);
    expect(count("queued")).toBe(110);
    expect(db.campaigns[0].status).toBe("sending");
    expect(res.camp1).toMatch(/daily tier limit/);
  });

  it("takes people with no phone number or who opted out out of the queue, so a run always ends", async () => {
    seed({ recipients: 30, badPhoneEvery: 10, optedOutEvery: 7 });
    await runCampaignSends();
    expect(count("queued")).toBe(0);
    expect(db.campaign_recipients.some((r) => r.error === "Contact has no phone number")).toBe(true);
    expect(db.campaign_recipients.some((r) => r.error === "Contact opted out")).toBe(true);
  });

  it("pauses a campaign when more than a fifth of sends fail", async () => {
    seed({ recipients: 60 });
    sendMock.mockImplementation(async () => { throw new Error("Meta said no"); });
    const res = await runCampaignSends();
    expect(db.campaigns[0].status).toBe("paused");
    expect(res.camp1).toMatch(/auto-paused/);
  });

  it("lets go of the campaign when finished, so a later run can pick up where it left off", async () => {
    seed({ recipients: 10, tier: 4 });
    await runCampaignSends();
    expect(db.campaigns[0].send_lock_until).toBeNull();
    db.workspaces[0].messaging_tier = 100;
    await runCampaignSends();
    expect(count("sent")).toBe(10);
  });

  it("holds a campaign whose workspace has no active plan, sending nothing", async () => {
    seed({ recipients: 5 });
    db.workspaces[0].plan = "free";
    await runCampaignSends();
    expect(sendMock).not.toHaveBeenCalled();
    expect(count("queued")).toBe(5);
  });
});

// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = {};
const authUpdates: Array<{ id: string; attrs: Record<string, unknown> }> = [];

function table(name: string) {
  const filters: Array<(r: Row) => boolean> = [];
  let patch: Row | null = null;
  let del = false;
  let latest = false;
  const rows = () => (db[name] ??= []).filter((r) => filters.every((f) => f(r)));
  const q: Record<string, unknown> = {
    select() { return q; }, update(p: Row) { patch = p; return q; }, delete() { del = true; return q; },
    insert(p: Row) { (db[name] ??= []).push({ id: `${name}-${(db[name]?.length ?? 0) + 1}`, created_at: String(db[name]?.length ?? 0).padStart(4, "0"), attempts: 0, ...p }); return Promise.resolve({ error: null }); },
    eq(c: string, v: unknown) { filters.push((r) => r[c] === v); return q; },
    is(c: string, v: unknown) { filters.push((r) => (v === null ? r[c] === null || r[c] === undefined : r[c] === v)); return q; },
    order() { latest = true; return q; }, limit() { return q; },
    single() { return Promise.resolve({ data: rows()[0] ?? null }); },
    maybeSingle() { const r = rows(); return Promise.resolve({ data: (latest ? r.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))) : r)[0] ?? null }); },
    then(resolve: (v: unknown) => unknown) {
      if (patch) { for (const r of rows()) Object.assign(r, patch); return resolve({ error: null }); }
      if (del) { db[name] = (db[name] ?? []).filter((r) => !filters.every((f) => f(r))); return resolve({ error: null }); }
      return resolve({ data: rows(), error: null });
    },
  };
  return q;
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: (n: string) => table(n), auth: { admin: { updateUserById: async (id: string, attrs: Record<string, unknown>) => { authUpdates.push({ id, attrs }); return { error: null }; } } } }),
}));
const sendMock = vi.fn();
vi.mock("@/lib/whatsapp", () => ({ sendTemplateMessage: (...a: unknown[]) => sendMock(...a) }));
let limited: string[] = [];
vi.mock("@/lib/rateLimit", () => ({ isRateLimited: async (key: string) => limited.some((p) => key.startsWith(p)) }));

import { checkVerificationCode, isPhoneVerified, otpRequired, sendVerificationCode } from "./phoneVerify";

function seed() {
  db.workspaces = [
    { id: "sys", whatsapp_phone_number_id: "p1", whatsapp_access_token: "t" },
    { id: "w1", owner_id: "u1", plan: "free", trial_ends_at: null },
  ];
  db.phone_verification_codes = [];
  authUpdates.length = 0;
  limited = [];
}

beforeEach(() => {
  process.env.SIGNUP_OTP_REQUIRED = "true";
  process.env.SYSTEM_SENDER_WORKSPACE_ID = "sys";
  sendMock.mockReset().mockResolvedValue({ metaMessageId: "wamid.1" });
  seed();
});

describe("switch", () => {
  it("is off until both the flag and the system sender are set", () => {
    expect(otpRequired()).toBe(true);
    process.env.SIGNUP_OTP_REQUIRED = "false";
    expect(otpRequired()).toBe(false);
    process.env.SIGNUP_OTP_REQUIRED = "true";
    delete process.env.SYSTEM_SENDER_WORKSPACE_ID;
    expect(otpRequired()).toBe(false);
  });
  it("treats old accounts as verified and only a new unverified one as not", () => {
    expect(isPhoneVerified({ app_metadata: {} })).toBe(true);
    expect(isPhoneVerified({ app_metadata: { phone_verified: true } })).toBe(true);
    expect(isPhoneVerified({ app_metadata: { phone_verified: false } })).toBe(false);
    expect(isPhoneVerified(null)).toBe(true);
  });
});

describe("sending a code", () => {
  it("stores only a hash and sends the code over WhatsApp from the system number", async () => {
    const res = await sendVerificationCode("u1", "919876543210");
    expect(res).toEqual({ ok: true });
    const sent = sendMock.mock.calls[0][0] as { to: string; otpCode: string };
    expect(sent.to).toBe("919876543210");
    expect(sent.otpCode).toMatch(/^\d{6}$/);
    expect(JSON.stringify(db.phone_verification_codes)).not.toContain(sent.otpCode);
  });
  it("does nothing when switched off", async () => {
    process.env.SIGNUP_OTP_REQUIRED = "false";
    expect(await sendVerificationCode("u1", "919876543210")).toEqual({ ok: false, error: "notAvailable" });
    expect(sendMock).not.toHaveBeenCalled();
  });
  it("makes the person wait between codes and caps them per hour", async () => {
    limited = ["otp-cool"];
    expect(await sendVerificationCode("u1", "919876543210")).toEqual({ ok: false, error: "wait" });
    limited = ["otp-hour"];
    expect(await sendVerificationCode("u1", "919876543210")).toEqual({ ok: false, error: "tooMany" });
    expect(sendMock).not.toHaveBeenCalled();
  });
  it("reports a failed send instead of pretending", async () => {
    sendMock.mockRejectedValueOnce(new Error("meta"));
    expect(await sendVerificationCode("u1", "919876543210")).toEqual({ ok: false, error: "sendFailed" });
  });
  it("is unavailable when the system number is not connected", async () => {
    db.workspaces[0].whatsapp_access_token = null;
    expect(await sendVerificationCode("u1", "919876543210")).toEqual({ ok: false, error: "notAvailable" });
  });
});

describe("checking a code", () => {
  async function codeSent() {
    await sendVerificationCode("u1", "919876543210");
    return (sendMock.mock.calls[0][0] as { otpCode: string }).otpCode;
  }

  it("verifies the account and starts the trial only then", async () => {
    const code = await codeSent();
    expect(db.workspaces[1].plan).toBe("free");
    expect(await checkVerificationCode("u1", code)).toEqual({ ok: true });
    expect(authUpdates).toEqual([{ id: "u1", attrs: { app_metadata: { phone_verified: true } } }]);
    expect(db.workspaces[1].plan).toBe("trial");
    expect(db.workspaces[1].trial_ends_at).toBeTruthy();
    expect(db.phone_verification_codes).toHaveLength(0);
  });
  it("rejects a wrong code and gives up after five tries", async () => {
    const code = await codeSent();
    for (let i = 0; i < 5; i++) expect(await checkVerificationCode("u1", "000000")).toEqual({ ok: false, error: "wrong" });
    expect(await checkVerificationCode("u1", code)).toEqual({ ok: false, error: "tooManyAttempts" });
    expect(authUpdates).toHaveLength(0);
    expect(db.workspaces[1].plan).toBe("free");
  });
  it("rejects an expired code", async () => {
    const code = await codeSent();
    db.phone_verification_codes[0].expires_at = new Date(Date.now() - 1000).toISOString();
    expect(await checkVerificationCode("u1", code)).toEqual({ ok: false, error: "expired" });
  });
  it("rejects when no code was ever sent", async () => {
    expect(await checkVerificationCode("u1", "123456")).toEqual({ ok: false, error: "expired" });
  });
  it("never grants a trial to a workspace that already had a plan", async () => {
    const code = await codeSent();
    db.workspaces[1].plan = "starter";
    await checkVerificationCode("u1", code);
    expect(db.workspaces[1].plan).toBe("starter");
  });
});

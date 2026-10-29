import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canSendFromWorkspace, hasConnectedNumber, NO_NUMBER_MESSAGE } from "./planGate";
import { GATE_COPY } from "./i18n/gateCopy";
import { LANGUAGES } from "./i18n/dictionaries";

/** A stand-in for the one query canSendFromWorkspace makes: how many extra numbers a workspace has. */
const fakeSupabase = (extraNumbers: number) =>
  ({ from: () => ({ select: () => ({ eq: async () => ({ count: extraNumbers }) }) }) }) as unknown as SupabaseClient;

describe("connected number check", () => {
  it("needs both the number id and the access token", () => {
    expect(hasConnectedNumber({ whatsapp_phone_number_id: "1", whatsapp_access_token: "t" })).toBe(true);
    expect(hasConnectedNumber({ whatsapp_phone_number_id: "1", whatsapp_access_token: null })).toBe(false);
    expect(hasConnectedNumber({ whatsapp_phone_number_id: null, whatsapp_access_token: "t" })).toBe(false);
    expect(hasConnectedNumber({})).toBe(false);
  });

  it("passes when the workspace's own number is connected, without asking the database", async () => {
    const boom = { from: () => { throw new Error("should not be asked"); } } as unknown as SupabaseClient;
    expect(await canSendFromWorkspace(boom, { id: "w", whatsapp_phone_number_id: "1", whatsapp_access_token: "t" })).toBe(true);
  });

  it("also passes when only an extra number was added under Channels", async () => {
    expect(await canSendFromWorkspace(fakeSupabase(2), { id: "w" })).toBe(true);
  });

  it("refuses when there is no number at all", async () => {
    expect(await canSendFromWorkspace(fakeSupabase(0), { id: "w" })).toBe(false);
    expect(await canSendFromWorkspace(fakeSupabase(0), {})).toBe(false);
  });

  it("the message tells the person what to do", () => {
    expect(NO_NUMBER_MESSAGE).toMatch(/connect/i);
    expect(NO_NUMBER_MESSAGE).toMatch(/channels/i);
  });
});

describe("no-plan banner copy", () => {
  it("exists in every language, in its own script", () => {
    const scripts: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/ };
    for (const { code } of LANGUAGES) {
      const t = GATE_COPY[code];
      for (const v of Object.values(t)) expect(v.trim().length, code).toBeGreaterThan(0);
      if (scripts[code]) for (const v of Object.values(t)) expect(v, code).toMatch(scripts[code]);
    }
  });
});

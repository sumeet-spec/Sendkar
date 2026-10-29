import { describe, it, expect } from "vitest";
import { CAMPAIGN_COPY } from "./campaignCopy";
import { GATE_COPY } from "./gateCopy";
import { LANGUAGES } from "./dictionaries";

const flat = (o: unknown, prefix = ""): Array<[string, string]> =>
  Object.entries(o as Record<string, unknown>).flatMap(([k, v]) => (typeof v === "string" ? [[`${prefix}${k}`, v] as [string, string]] : flat(v, `${prefix}${k}.`)));
const slots = (s: string) => (s.match(/\{(n|cat|langs)\}/g) ?? []).sort().join(",");

describe("campaign screens in every language", () => {
  const en = new Map(flat(CAMPAIGN_COPY.en));
  for (const { code } of LANGUAGES) {
    it(`${code}: every line present, filled, with the same {n}/{cat}/{langs} slots as English`, () => {
      const mine = new Map(flat(CAMPAIGN_COPY[code]));
      expect([...mine.keys()].sort()).toEqual([...en.keys()].sort());
      for (const [k, v] of mine) {
        expect(v.trim().length, `${code} ${k}`).toBeGreaterThan(0);
        expect(slots(v), `${code} ${k}`).toBe(slots(en.get(k)!));
      }
    });
  }

  it("is written in each language's own script", () => {
    const scripts: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/ };
    for (const [code, re] of Object.entries(scripts)) for (const [k, v] of flat(CAMPAIGN_COPY[code as keyof typeof CAMPAIGN_COPY])) expect(v, `${code} ${k}`).toMatch(re);
  });

  it("the audience sentence starts with the number so the page can show it in bold", () => {
    for (const { code } of LANGUAGES) expect(CAMPAIGN_COPY[code].form.willReceive.startsWith("{n}"), code).toBe(true);
  });

  it("no competitor names", () => {
    for (const { code } of LANGUAGES) for (const [k, v] of flat(CAMPAIGN_COPY[code])) expect(v, `${code} ${k}`).not.toMatch(/\b(wati|interakt|aisensy|gallabox|doubletick)\b/i);
  });
});

describe("refusal messages", () => {
  it("exist in every language, in its own script", () => {
    const scripts: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/ };
    for (const { code } of LANGUAGES) {
      for (const v of [GATE_COPY[code].refusedNoPlan, GATE_COPY[code].refusedNoNumber]) {
        expect(v.trim().length, code).toBeGreaterThan(0);
        if (scripts[code]) expect(v, code).toMatch(scripts[code]);
      }
    }
  });
});

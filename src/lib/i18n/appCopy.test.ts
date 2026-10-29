import { describe, it, expect } from "vitest";
import { APP_COPY, fillN } from "./appCopy";
import { LANGUAGES } from "./dictionaries";

const en = APP_COPY.en;
const flat = (o: unknown, prefix = ""): Array<[string, string]> =>
  Object.entries(o as Record<string, unknown>).flatMap(([k, v]) => typeof v === "string" ? [[`${prefix}${k}`, v] as [string, string]] : flat(v, `${prefix}${k}.`));
const placeholders = (s: string) => (s.match(/\{(n|total)\}/g) ?? []).sort().join(",");

describe("app copy in every language", () => {
  const enFlat = new Map(flat(en));
  for (const { code } of LANGUAGES) {
    it(`${code}: has every line, none empty, with the same {n}/{total} slots as English`, () => {
      const mine = new Map(flat(APP_COPY[code]));
      expect([...mine.keys()].sort()).toEqual([...enFlat.keys()].sort());
      for (const [k, v] of mine) {
        expect(v.trim().length, `${code} ${k}`).toBeGreaterThan(0);
        expect(placeholders(v), `${code} ${k}`).toBe(placeholders(enFlat.get(k)!));
      }
    });
  }

  it("is written in each language's own script, not English repeated", () => {
    const scripts: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/ };
    for (const [code, re] of Object.entries(scripts)) {
      for (const [k, v] of flat(APP_COPY[code as keyof typeof APP_COPY])) expect(v, `${code} ${k}`).toMatch(re);
    }
  });

  it("never promises or names what the product does not do", () => {
    for (const { code } of LANGUAGES) for (const [k, v] of flat(APP_COPY[code])) expect(v, `${code} ${k}`).not.toMatch(/\b(wati|interakt|aisensy|gallabox|doubletick)\b/i);
  });

  it("fills numbers in", () => {
    expect(fillN(APP_COPY.gu.report.gotIt, 412, 500)).toContain("412");
    expect(fillN(APP_COPY.gu.report.gotIt, 412, 500)).toContain("500");
    expect(fillN(APP_COPY.hi.cards.inDays, 3)).not.toContain("{n}");
  });
});

import { describe, it, expect } from "vitest";
import { LIBRARY_COPY } from "./libraryCopy";
import { LANGUAGES } from "./dictionaries";

const slots = (s: string) => (s.match(/\{(n|date)\}/g) ?? []).sort().join(",");

describe("library copy", () => {
  for (const { code } of LANGUAGES) {
    it(`${code}: every line filled, same slots as English`, () => {
      const en = LIBRARY_COPY.en as Record<string, string>;
      const mine = LIBRARY_COPY[code] as Record<string, string>;
      expect(Object.keys(mine).sort()).toEqual(Object.keys(en).sort());
      for (const [k, v] of Object.entries(mine)) {
        expect(v.trim().length, `${code} ${k}`).toBeGreaterThan(0);
        expect(slots(v), `${code} ${k}`).toBe(slots(en[k]));
      }
    });
  }
  it("is written in each language's own script", () => {
    const scripts: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/ };
    for (const [code, re] of Object.entries(scripts)) for (const [k, v] of Object.entries(LIBRARY_COPY[code as keyof typeof LIBRARY_COPY])) expect(v, `${code} ${k}`).toMatch(re);
  });
});

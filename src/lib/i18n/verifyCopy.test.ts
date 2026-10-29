import { describe, it, expect } from "vitest";
import { VERIFY_COPY } from "./verifyCopy";
import { LANGUAGES } from "./dictionaries";

describe("verify copy", () => {
  for (const { code } of LANGUAGES) {
    it(`${code}: complete, with the phone slot and every error`, () => {
      const t = VERIFY_COPY[code];
      expect(t.sentTo).toContain("{phone}");
      for (const v of [...Object.values(t).filter((x) => typeof x === "string"), ...Object.values(t.errors)] as string[]) expect(v.trim().length).toBeGreaterThan(0);
      expect(Object.keys(t.errors).sort()).toEqual(Object.keys(VERIFY_COPY.en.errors).sort());
    });
  }
  it("is in each language's own script", () => {
    const scripts: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/ };
    for (const [code, re] of Object.entries(scripts)) {
      const t = VERIFY_COPY[code as keyof typeof VERIFY_COPY];
      for (const v of [t.title, t.sentTo, t.verify, ...Object.values(t.errors)]) expect(v, code).toMatch(re);
    }
  });
});

import { describe, it, expect } from "vitest";
import { FESTIVAL_NAMES, festivalName, localDate } from "./festivalNames";
import { FESTIVALS } from "./festivals";
import { LANGUAGES } from "./i18n/dictionaries";

const base = (id: string) => id.replace(/-\d{4}$/, "");

describe("festival names in every language", () => {
  it("every festival in the calendar has a native name", () => {
    for (const f of FESTIVALS) expect(FESTIVAL_NAMES[base(f.id)], f.id).toBeDefined();
  });

  it("each name is written in the language's own script", () => {
    const scripts: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/ };
    for (const [key, names] of Object.entries(FESTIVAL_NAMES)) for (const [code, re] of Object.entries(scripts)) expect(names[code as keyof typeof names], `${key}/${code}`).toMatch(re);
  });

  it("English keeps the festival's own name, and an unknown festival falls back to it", () => {
    expect(festivalName("diwali-2026", "Diwali", "en")).toBe("Diwali");
    expect(festivalName("made-up-2026", "Made Up", "gu")).toBe("Made Up");
    expect(festivalName("diwali-2027", "Diwali", "gu")).toBe("દિવાળી");
  });
});

describe("dates in the language's own words", () => {
  it("writes 8 November in each script, not in English letters", () => {
    expect(localDate("2026-11-08", "en")).toMatch(/8/);
    for (const { code } of LANGUAGES.filter((l) => l.code !== "en")) expect(localDate("2026-11-08", code).length, code).toBeGreaterThan(2);
    expect(localDate("2026-11-08", "gu")).toMatch(/[઀-૿]/);
    expect(localDate("2026-11-08", "ta")).toMatch(/[஀-௿]/);
  });
});

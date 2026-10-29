import { describe, it, expect } from "vitest";
import { LANGUAGES } from "./dictionaries";
import { getSiteCopy, fill } from "./site";

const codes = LANGUAGES.map((l) => l.code);
const en = getSiteCopy("en");

/** Every string in a copy object, depth-first. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("homepage copy: every language is complete", () => {
  for (const code of codes) {
    const t = getSiteCopy(code);

    it(`${code}: has the same shape as English and no empty strings`, () => {
      expect(t.jobs.items).toHaveLength(en.jobs.items.length);
      expect(t.steps.items).toHaveLength(en.steps.items.length);
      expect(t.trust.items).toHaveLength(en.trust.items.length);
      expect(t.faq.items).toHaveLength(en.faq.items.length);
      expect(t.chat.messages).toHaveLength(en.chat.messages.length);
      for (const plan of ["starter", "growth", "scale"] as const) {
        expect(t.pricing.plans[plan].features).toHaveLength(en.pricing.plans[plan].features.length);
      }
      for (const s of strings(t)) expect(s.trim().length).toBeGreaterThan(0);
    });

    it(`${code}: keeps the {n} placeholders the page fills in`, () => {
      expect(t.pricing.numberMany).toContain("{n}");
      expect(t.pricing.images).toContain("{n}");
      expect(fill(t.pricing.numberMany, 5)).not.toContain("{n}");
      expect(fill(t.pricing.numberMany, 5)).toContain("5");
    });

    it(`${code}: the example chat alternates shop and customer like the English one`, () => {
      expect(t.chat.messages.map((m) => m.side)).toEqual(en.chat.messages.map((m) => m.side));
    });

    it(`${code}: titles fit in a browser tab and descriptions in a link preview`, () => {
      expect(t.meta.title.length).toBeLessThanOrEqual(110);
      expect(t.meta.description.length).toBeLessThanOrEqual(260);
    });
  }

  it("is not simply English repeated: each other language is written in its own script", () => {
    const scripts: Record<string, RegExp> = {
      hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/,
      ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/,
    };
    for (const [code, script] of Object.entries(scripts)) {
      const t = getSiteCopy(code as (typeof codes)[number]);
      for (const s of [t.hero.titleA, t.hero.sub, t.nav.start, t.final.title, t.faq.items[0].q, t.pricing.title]) {
        expect(s, `${code}: ${s}`).toMatch(script);
      }
    }
  });
});

// The rules from Sendkar's own marketing notes, enforced for the whole page in every language.
describe("homepage copy: marketing rules", () => {
  const all = codes.flatMap((c) => strings(getSiteCopy(c)));

  it("never names a competitor", () => {
    for (const s of all) expect(s).not.toMatch(/\b(wati|interakt|aisensy|gallabox|doubletick)\b/i);
  });

  it("uses plain words: no developer jargon a shopkeeper would not know", () => {
    for (const s of all) expect(s).not.toMatch(/cloud api|\bapi\b|webhook|\bmcp\b|attribution|\bbsp\b|reseller|\bsdk\b/i);
  });

  it("never leads with price: the hero and the badge carry no rupee amount", () => {
    for (const c of codes) {
      const t = getSiteCopy(c);
      for (const s of [t.hero.badge, t.hero.titleA, t.hero.titleB, t.hero.sub, t.hero.cta]) expect(s).not.toMatch(/₹|\brs\b/i);
    }
  });

  it("promises a free trial of 7 days, never a free forever plan", () => {
    for (const s of all) expect(s).not.toMatch(/forever|free plan/i);
    expect(en.hero.cta).toMatch(/7/);
    expect(en.pricing.sub).toMatch(/7 days free/);
  });

  it("states the message fees as 'about', since they are quoted from a third party and can change", () => {
    expect(en.faq.items.find((i) => i.q.includes("cost"))?.a).toMatch(/about/);
  });
});

// @vitest-environment node
import { describe, it, expect } from "vitest";
import { FREE_CARD_COLOURS, indianMobile } from "./freeCard";
import { FREE_CARD_COPY } from "./i18n/freeCardCopy";
import { LANGUAGES } from "./i18n/dictionaries";
import { renderCardPng, buildCardSvg } from "./cards/renderCard";
import { brandPalette, designById } from "./cards/designs";

describe("indianMobile", () => {
  it("accepts the ways a shopkeeper types a number", () => {
    expect(indianMobile("98765 43210")).toBe("919876543210");
    expect(indianMobile("+91 98765-43210")).toBe("919876543210");
    expect(indianMobile("09876543210")).toBe("919876543210");
    expect(indianMobile("919876543210")).toBe("919876543210");
    expect(indianMobile("0091 9876543210")).toBe("919876543210");
  });
  it("refuses numbers that cannot be real", () => {
    expect(indianMobile("12345")).toBeNull();
    expect(indianMobile("5876543210")).toBeNull(); // Indian mobiles start 6-9
    expect(indianMobile("")).toBeNull();
    expect(indianMobile("abc")).toBeNull();
  });
});

describe("free card page copy", () => {
  const en = FREE_CARD_COPY.en as Record<string, string>;
  for (const { code } of LANGUAGES) {
    it(`${code}: complete, with the {shop} and {url} slots in the share text`, () => {
      const t = FREE_CARD_COPY[code] as Record<string, string>;
      expect(Object.keys(t).sort()).toEqual(Object.keys(en).sort());
      for (const [k, v] of Object.entries(t)) expect(v.trim().length, `${code} ${k}`).toBeGreaterThan(0);
      expect(t.shareText).toContain("{shop}");
      expect(t.shareText).toContain("{url}");
      expect(t.leadConsent).toContain("STOP");
    });
  }
  it("is in each language's own script", () => {
    const scripts: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/ };
    for (const [code, re] of Object.entries(scripts)) for (const [k, v] of Object.entries(FREE_CARD_COPY[code as keyof typeof FREE_CARD_COPY])) expect(v, `${code} ${k}`).toMatch(re);
  });
});

describe("free card colours and watermark", () => {
  it("every colour choice is a real colour or the festival's own", () => {
    for (const c of FREE_CARD_COLOURS) expect(c.primary === null || /^#[0-9a-f]{6}$/i.test(c.primary), c.key).toBe(true);
    expect(FREE_CARD_COLOURS[0].key).toBe("festival");
  });
  it("puts the credit line on the card, and renders a real PNG in every colour", () => {
    const d = designById("diwali-1")!;
    const svg = buildCardSvg({ lang: "gu", headline: "x", businessName: "શર્મા ટ્રેડર્સ", primaryColor: "#14532d", accentColor: "#fcd34d", design: { motif: d.motif, variant: d.variant, palette: d.palette }, watermark: "Made with Sendkar · sendkar.shop" });
    expect(svg.length).toBeGreaterThan(3000);
    for (const c of FREE_CARD_COLOURS) {
      const png = renderCardPng({ lang: "gu", headline: "દિવાળી", businessName: "શર્મા ટ્રેડર્સ", primaryColor: c.primary ?? "#14532d", accentColor: "#fcd34d", size: 300, design: { motif: d.motif, variant: d.variant, palette: c.primary ? brandPalette(c.primary, "#fcd34d") : d.palette }, watermark: "Made with Sendkar · sendkar.shop" });
      expect(png.subarray(0, 4).toString("hex")).toBe("89504e47");
    }
  }, 30_000);
  it("a name with markup or odd characters stays plain text on the card", () => {
    const d = designById("diwali-1")!;
    const svg = buildCardSvg({ lang: "en", headline: "Hi", businessName: '<script>alert(1)</script> "&', primaryColor: "#14532d", accentColor: "#fcd34d", design: { motif: d.motif, variant: d.variant, palette: d.palette } });
    expect(svg).not.toContain("<script");
  });
});

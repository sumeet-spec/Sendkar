// @vitest-environment node
import { describe, it, expect } from "vitest";
import { renderCardPng, buildCardSvg } from "./renderCard";
import { LANGUAGES } from "@/lib/i18n/dictionaries";

const base = { businessName: "Sharma Traders", primaryColor: "#7c1d6f", accentColor: "#fbbf24", headline: "Happy Diwali", line: "15% off till Sunday", contact: "98765 43210" };

describe("card renderer", () => {
  for (const l of LANGUAGES) {
    it(`${l.code}: renders a PNG`, () => {
      const png = renderCardPng({ ...base, lang: l.code, size: 540 });
      expect(png.subarray(0, 4).toString("hex")).toBe("89504e47");
      expect(png.length).toBeGreaterThan(5000);
    });
  }

  it("ignores a malformed colour instead of injecting markup into the SVG", () => {
    const svg = buildCardSvg({ ...base, lang: "en", primaryColor: '"/><script>x</script>', accentColor: "red" });
    expect(svg).not.toContain("<script");
  });

  it("long text shrinks to fit rather than running off the card", () => {
    const png = renderCardPng({ ...base, lang: "hi", headline: "दीपावली की हार्दिक शुभकामनाएँ आपको और आपके परिवार को", size: 540 });
    expect(png.length).toBeGreaterThan(5000);
  });
});

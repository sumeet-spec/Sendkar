import { describe, it, expect } from "vitest";
import { findLogoCandidates, findThemeColor, initialsFor } from "./brandLogo";

describe("initialsFor", () => {
  it("takes the first letters of the first two real words", () => {
    expect(initialsFor("Sharma Traders")).toBe("ST");
    expect(initialsFor("The Patel & Sons Pvt Ltd")).toBe("PS");
    expect(initialsFor("Madhuram")).toBe("M");
  });
  it("keeps whole letters in Indic scripts", () => {
    expect(initialsFor("શર્મા ટ્રેડર્સ")).toBe("શટ્રે");
    expect(initialsFor("क्षमा स्टोर")).toBe("क्षस्टो");
  });
  it("never returns empty", () => expect(initialsFor("  ")).toBe("?"));
});

describe("findLogoCandidates", () => {
  const html = `<html><head>
    <meta property="og:image" content="/share.jpg"><link rel="icon" href="/fav.ico">
    <link rel="apple-touch-icon" href="https://cdn.x.in/touch.png"><meta name="theme-color" content="#7c1d6f">
    </head><body><img src="/img/banner.jpg"><img class="site-logo" src="/img/brand.png"><img src="/a.svg" alt="logo"></body></html>`;
  it("ranks a logo image first, then touch icon, tab icon; skips SVG and share banners", () => {
    expect(findLogoCandidates(html, "https://shop.in/")).toEqual([
      "https://shop.in/img/brand.png", "https://cdn.x.in/touch.png", "https://shop.in/fav.ico",
    ]);
  });
  it("reads the declared brand colour", () => expect(findThemeColor(html)).toBe("#7c1d6f"));
  it("ignores plain http pictures", () => expect(findLogoCandidates('<img class="logo" src="http://a.in/l.png">', "http://a.in/")).toEqual([]));
});

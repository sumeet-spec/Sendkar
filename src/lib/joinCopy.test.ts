// @vitest-environment node
import { describe, it, expect } from "vitest";
import QRCode from "qrcode";
import { JOIN_COPY, withShop } from "./joinCopy";
import { isJoinCode, newJoinCode } from "./joinCode";
import { LANGUAGES } from "./i18n/dictionaries";
import { renderPosterPng } from "./cards/renderCard";

describe("join page copy", () => {
  for (const { code } of LANGUAGES) {
    it(`${code}: every line is filled in and the consent names the shop and STOP`, () => {
      const t = JOIN_COPY[code];
      for (const v of Object.values(t)) expect(v.trim().length).toBeGreaterThan(0);
      expect(t.consent).toContain("{shop}");
      expect(t.consent).toContain("STOP");
      expect(withShop(t.done, "Sharma Traders")).toContain("Sharma Traders");
    });
  }
  it("is written in each language's own script", () => {
    const scripts: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/ };
    for (const [code, re] of Object.entries(scripts)) for (const v of Object.values(JOIN_COPY[code as keyof typeof JOIN_COPY])) expect(v, `${code}: ${v}`).toMatch(re);
  });
});

describe("join code", () => {
  it("is 8 easy characters and validates", () => {
    for (let i = 0; i < 50; i++) expect(isJoinCode(newJoinCode())).toBe(true);
    expect(isJoinCode("../etc")).toBe(false);
    expect(isJoinCode("ab")).toBe(false);
  });
});

describe("counter poster", () => {
  it("renders in every language", () => {
    const qr = QRCode.create("https://www.sendkar.shop/join/abcd2345?lang=hi", { errorCorrectionLevel: "M" });
    const modules = Array.from({ length: qr.modules.size }, (_, r) => Array.from({ length: qr.modules.size }, (_, c) => Boolean(qr.modules.get(r, c))));
    for (const { code } of LANGUAGES) {
      const png = renderPosterPng({ lang: code, scanText: JOIN_COPY[code].scan, businessName: "Sharma Traders", qr: modules, primaryColor: "#14532d", accentColor: "#fcd34d" });
      expect(png.subarray(0, 4).toString("hex")).toBe("89504e47");
    }
  });
});

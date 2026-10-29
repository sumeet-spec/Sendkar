// @vitest-environment node
import { describe, it, expect } from "vitest";
import { DESIGNS, brandPalette, designById, designsFor } from "./designs";
import { FESTIVALS } from "../festivals";
import { occasionById, OCCASIONS } from "./occasions";
import { renderCardPng, buildCardSvg } from "./renderCard";
import { designInput } from "./designRender";
import { ART } from "./artManifest";
import fs from "node:fs";
import path from "node:path";

describe("festival library designs", () => {
  it("every festival has at least three designs to choose from", () => {
    for (const f of FESTIVALS) expect(designsFor(f.occasion).length, f.id).toBeGreaterThanOrEqual(3);
  });
  it("ids are unique and look up", () => {
    expect(new Set(DESIGNS.map((d) => d.id)).size).toBe(DESIGNS.length);
    for (const d of DESIGNS) expect(designById(d.id)).toBe(d);
  });
  it("every design belongs to a known occasion", () => {
    for (const d of DESIGNS) expect(occasionById(d.occasion), d.id).toBeDefined();
  });
  it("every occasion that has a festival or an offer card has designs", () => {
    for (const o of OCCASIONS) expect(designsFor(o.id).length, o.id).toBeGreaterThan(0);
  });
  it("renders every design as a PNG in every language, without errors", () => {
    for (const d of DESIGNS) {
      const png = renderCardPng({ lang: "hi", headline: occasionById(d.occasion)!.label.hi, businessName: "शर्मा ट्रेडर्स", primaryColor: "#14532d", accentColor: "#fcd34d", size: 270, design: designInput(d, "festival", { primary: "#14532d", accent: "#fcd34d" }) });
      expect(png.subarray(0, 4).toString("hex"), d.id).toBe("89504e47");
    }
  }, 60_000);
  it("every picture in the manifest exists on disk, is a real JPEG, and has a design", () => {
    for (const a of ART) {
      const file = path.join(process.cwd(), "src", "assets", "art", a.file);
      expect(fs.existsSync(file), a.file).toBe(true);
      const head = fs.readFileSync(file).subarray(0, 3);
      expect(head[0] === 0xff && head[1] === 0xd8, a.file).toBe(true);
      expect(designById(a.id), a.id).toBeDefined();
      expect(a.avg).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
  it("the same design can be shown in a shop's own colours", () => {
    const p = brandPalette("#0f4c81", "#f59e0b");
    for (const c of Object.values(p)) expect(c).toMatch(/^#[0-9a-f]{6}$/);
    const svg = buildCardSvg({ lang: "en", headline: "Happy Diwali", businessName: "Shop", primaryColor: "#0f4c81", accentColor: "#f59e0b", design: { motif: "diyas", variant: 0, palette: p } });
    expect(svg).toContain(p.bg1);
  });
  it("a bad colour cannot inject markup", () => {
    const p = brandPalette('"/><script>', "red");
    expect(JSON.stringify(p)).not.toContain("<script");
  });
});

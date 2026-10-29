import { describe, it, expect } from "vitest";
import { looksLike, parseTranslations } from "./translateLine";

describe("parseTranslations", () => {
  it("reads a clean reply", () => {
    expect(parseTranslations('{"hi":"रविवार तक 15% छूट","gu":"રવિવાર સુધી 15% છૂટ"}', ["hi", "gu"])).toEqual({ hi: "रविवार तक 15% छूट", gu: "રવિવાર સુધી 15% છૂટ" });
  });
  it("copes with a code fence and chatter around it", () => {
    expect(parseTranslations('Here you go:\n```json\n{"ta":"ஞாயிறு வரை 15% தள்ளுபடி"}\n```', ["ta"])).toEqual({ ta: "ஞாயிறு வரை 15% தள்ளுபடி" });
  });
  it("drops an answer written in the wrong script", () => {
    expect(parseTranslations('{"hi":"15% off till Sunday","gu":"રવિવાર સુધી 15% છૂટ"}', ["hi", "gu"])).toEqual({ gu: "રવિવાર સુધી 15% છૂટ" });
  });
  it("returns nothing for junk", () => {
    expect(parseTranslations("sorry, cannot", ["hi"])).toEqual({});
    expect(parseTranslations("{not json}", ["hi"])).toEqual({});
  });
  it("ignores languages that were not asked for", () => {
    expect(parseTranslations('{"hi":"छूट","te":"తగ్గింపు"}', ["hi"])).toEqual({ hi: "छूट" });
  });
});

describe("looksLike", () => {
  it("English accepts anything non-empty", () => { expect(looksLike("en", "15% off")).toBe(true); expect(looksLike("en", " ")).toBe(false); });
  it("Marathi uses Devanagari", () => { expect(looksLike("mr", "सवलत")).toBe(true); expect(looksLike("mr", "discount")).toBe(false); });
});

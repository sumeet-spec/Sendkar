import { describe, it, expect } from "vitest";
import { buildTemplateComponents, countBodyVariables, exampleValues } from "./templateBuild";

describe("countBodyVariables", () => {
  it("counts the highest variable index", () => {
    expect(countBodyVariables("no variables")).toBe(0);
    expect(countBodyVariables("Hi {{1}}, {{2}} and {{3}}")).toBe(3);
    expect(countBodyVariables("Repeated {{1}} and {{1}}")).toBe(1);
  });
});

describe("exampleValues", () => {
  it("uses provided examples, then falls back per variable", () => {
    expect(exampleValues("{{1}} {{2}} {{3}}", ["Anil", "", undefined as unknown as string])).toEqual(["Anil", "Maheshwari Steel House", "Diwali"]);
  });
  it("never returns fewer examples than variables", () => {
    expect(exampleValues("{{1}}{{2}}{{3}}{{4}}{{5}}{{6}}{{7}}{{8}}{{9}}")).toHaveLength(9);
  });
});

describe("buildTemplateComponents", () => {
  it("adds body examples whenever the body has variables (Meta rejects it otherwise)", () => {
    const [body] = buildTemplateComponents({ bodyText: "Hello {{1}}, your bill {{2}} is ready." });
    expect(body).toEqual({ type: "BODY", text: "Hello {{1}}, your bill {{2}} is ready.", example: { body_text: [["Rajesh", "Maheshwari Steel House"]] } });
  });
  it("omits the example for a body with no variables", () => {
    expect(buildTemplateComponents({ bodyText: "Plain message" })[0]).toEqual({ type: "BODY", text: "Plain message" });
  });
  it("keeps header, footer and buttons in Meta's order", () => {
    const c = buildTemplateComponents({
      headerType: "text", headerText: "Offer", bodyText: "Body", footerText: "Reply Stop", buttons: [{ type: "QUICK_REPLY", text: "Stop" }],
    });
    expect(c.map((x) => x.type)).toEqual(["HEADER", "BODY", "FOOTER", "BUTTONS"]);
  });
  it("rejects a carousel with too few cards", () => {
    expect(() => buildTemplateComponents({ bodyText: "b", carouselCards: [{ headerHandle: "h", bodyText: "c" }] })).toThrow(/2 and 10/);
  });
});

import { describe, it, expect } from "vitest";
import { cleanNames, contactLine, nameFor, sniffImage } from "./brandKit";
import { OCCASIONS, matchOccasion } from "./cards/occasions";
import { LANGUAGES } from "./i18n/dictionaries";
import { buildTemplateComponents } from "./templateBuild";

describe("brand kit", () => {
  it("uses the name written for the card language, else the main name", () => {
    const kit = { name: "Sharma Traders", names: { gu: "શર્મા ટ્રેડર્સ" } };
    expect(nameFor(kit, "gu")).toBe("શર્મા ટ્રેડર્સ");
    expect(nameFor(kit, "hi")).toBe("Sharma Traders");
  });

  it("keeps only known languages and drops empty names", () => {
    expect(cleanNames({ gu: " શર્મા ", hi: "  ", xx: "nope", en: 5 })).toEqual({ gu: "શર્મા" });
  });

  it("recognises the real image type from the bytes, not the claimed one", () => {
    expect(sniffImage(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0, 0]))?.mime).toBe("image/png");
    expect(sniffImage(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe("image/jpeg");
    expect(sniffImage(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'></svg>"))).toBeNull();
  });

  it("joins only the contact details that exist", () => {
    expect(contactLine({ phone: "98765 43210", address: "", website: " shop.in " })).toBe("98765 43210  ·  shop.in");
  });
});

describe("occasions", () => {
  it("has a greeting in every language for every occasion", () => {
    for (const o of OCCASIONS) for (const l of LANGUAGES) expect(o.label[l.code].trim().length, `${o.id}/${l.code}`).toBeGreaterThan(0);
  });

  it("each greeting is written in its own script", () => {
    const scripts: Record<string, RegExp> = { hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/ };
    for (const o of OCCASIONS) for (const [code, re] of Object.entries(scripts)) expect(o.label[code as keyof typeof o.label], `${o.id}/${code}`).toMatch(re);
  });

  it("picks the occasion from what a shopkeeper types, in English or their own script", () => {
    expect(matchOccasion("create a card for Diwali")?.id).toBe("diwali");
    expect(matchOccasion("દિવાળી માટે કાર્ડ")?.id).toBe("diwali");
    expect(matchOccasion("होली का कार्ड")?.id).toBe("holi");
    expect(matchOccasion("something unrelated")).toBeNull();
  });
});

describe("image-header templates", () => {
  it("send Meta the sample picture handle Meta requires", () => {
    const parts = buildTemplateComponents({ headerType: "image", headerHandle: "4::abc", bodyText: "Hello" });
    expect(parts[0]).toEqual({ type: "HEADER", format: "IMAGE", example: { header_handle: ["4::abc"] } });
  });
});

describe("cleanGstin", () => {
  it("accepts a real-looking GSTIN in any case or spacing, and blank", async () => {
    const { cleanGstin } = await import("./brandKit");
    expect(cleanGstin("24abcde1234f1z5")).toBe("24ABCDE1234F1Z5");
    expect(cleanGstin(" 24ABCDE1234F1Z5 ")).toBe("24ABCDE1234F1Z5");
    expect(cleanGstin("")).toBe("");
  });
  it("refuses anything that cannot be one", async () => {
    const { cleanGstin } = await import("./brandKit");
    for (const bad of ["24ABCDE1234F1Z", "ABCDE1234F", "24ABCDE1234F1X5", "24ABCDE1234F1Z5Z"]) expect(cleanGstin(bad), bad).toBeNull();
  });
});

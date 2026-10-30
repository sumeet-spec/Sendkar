import { describe, it, expect } from "vitest";
import { chatDigits, chatUrl, CHAT_GREETING } from "./chatLink";
import { LANGUAGES } from "./i18n/dictionaries";

describe("chatDigits", () => {
  it("builds the wa.me number from the ways a shop writes it", () => {
    expect(chatDigits("98765 43210")).toBe("919876543210");
    expect(chatDigits("+91 98765-43210")).toBe("919876543210");
    expect(chatDigits("09876543210")).toBe("919876543210");
    expect(chatDigits("919876543210")).toBe("919876543210");
  });
  it("refuses what cannot be a number", () => {
    expect(chatDigits("")).toBeNull();
    expect(chatDigits("12345")).toBeNull();
    expect(chatDigits("abc")).toBeNull();
  });
});

describe("chatUrl", () => {
  it("opens a chat with a greeting in the poster's language", () => {
    const u = new URL(chatUrl("98765 43210", "gu")!);
    expect(u.origin + u.pathname).toBe("https://wa.me/919876543210");
    expect(u.searchParams.get("text")).toBe(CHAT_GREETING.gu);
  });
  it("has a greeting for every language", () => {
    for (const { code } of LANGUAGES) expect(CHAT_GREETING[code].length).toBeGreaterThan(1);
  });
  it("is null without a usable number", () => {
    expect(chatUrl("", "en")).toBeNull();
  });
});

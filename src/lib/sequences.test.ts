import { describe, it, expect } from "vitest";
import { interpolate } from "./sequences";

describe("interpolate", () => {
  it("replaces known placeholders", () => {
    expect(interpolate("Still want this? {{checkout_url}}", { checkout_url: "https://x.co/c" })).toBe(
      "Still want this? https://x.co/c",
    );
  });

  it("replaces multiple distinct placeholders", () => {
    expect(interpolate("{{amount}} for {{name}}", { amount: "₹4,200", name: "Priya" })).toBe("₹4,200 for Priya");
  });

  it("leaves unknown placeholders blank rather than throwing", () => {
    expect(interpolate("Hi {{missing}}!", {})).toBe("Hi !");
  });

  it("passes through text with no placeholders unchanged", () => {
    expect(interpolate("plain text", { amount: 1 })).toBe("plain text");
  });
});

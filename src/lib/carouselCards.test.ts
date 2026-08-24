import { describe, it, expect } from "vitest";
import { parseCarouselCards } from "./carouselCards";

describe("parseCarouselCards", () => {
  it("parses a header + body line with no buttons", () => {
    const cards = parseCarouselCards("HANDLE_1 | Buy one, get one free");
    expect(cards).toEqual([{ headerHandle: "HANDLE_1", bodyText: "Buy one, get one free", buttons: undefined }]);
  });

  it("parses buttons, capped at 2, as QUICK_REPLY", () => {
    const cards = parseCarouselCards("H1 | Body | Shop now, Learn more, Ignored third");
    expect(cards[0].buttons).toEqual([
      { type: "QUICK_REPLY", text: "Shop now" },
      { type: "QUICK_REPLY", text: "Learn more" },
    ]);
  });

  it("parses multiple cards, one per line", () => {
    const cards = parseCarouselCards("H1 | Body one\nH2 | Body two");
    expect(cards).toHaveLength(2);
    expect(cards[1]).toEqual({ headerHandle: "H2", bodyText: "Body two", buttons: undefined });
  });

  it("skips blank lines", () => {
    const cards = parseCarouselCards("H1 | Body one\n\n\nH2 | Body two");
    expect(cards).toHaveLength(2);
  });

  it("drops a line missing a header handle or body text", () => {
    expect(parseCarouselCards("| missing header")).toEqual([]);
    expect(parseCarouselCards("H1 | ")).toEqual([]);
    expect(parseCarouselCards("just one field, no pipe")).toEqual([]);
  });

  it("trims whitespace around every field", () => {
    const cards = parseCarouselCards("  H1   |   Body text   |  Button one , Button two  ");
    expect(cards[0]).toEqual({
      headerHandle: "H1",
      bodyText: "Body text",
      buttons: [
        { type: "QUICK_REPLY", text: "Button one" },
        { type: "QUICK_REPLY", text: "Button two" },
      ],
    });
  });

  it("handles CRLF line endings", () => {
    const cards = parseCarouselCards("H1 | Body one\r\nH2 | Body two");
    expect(cards).toHaveLength(2);
  });

  it("returns an empty array for empty input", () => {
    expect(parseCarouselCards("")).toEqual([]);
  });
});

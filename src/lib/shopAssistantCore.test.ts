import { describe, it, expect } from "vitest";
import { buildAssistantPrompt, buildKnowledge, parseAssistantReply, hoursText, type KnowledgeInput } from "./shopAssistantCore";

const base: KnowledgeInput = {
  shopName: "Sharma Traders", address: "Station Road, Bidar", phone: "98765 43210", website: "",
  hours: [{ day_of_week: 1, opens_at: "10:00:00", closes_at: "20:00:00" }, { day_of_week: 0, opens_at: null, closes_at: null }],
  items: [
    { kind: "item", name: "Basmati rice 5kg", price: 640, unit: "per bag", description: null },
    { kind: "service", name: "Home delivery", price: null, unit: null, description: "Within the city" },
  ],
  payUpi: { id: "sharma@okhdfcbank", name: "Sharma Traders" },
  customerName: "Rajesh", customerLanguage: "Gujarati",
  unpaid: [{ billNo: "B12", amount: 1328, payUrl: "https://www.sendkar.shop/p/abc123" }],
};

describe("buildKnowledge", () => {
  const k = buildKnowledge(base);
  it("lists the shop, its hours, items with prices and unit", () => {
    expect(k).toContain("SHOP: Sharma Traders");
    expect(k).toContain("Station Road, Bidar");
    expect(k).toContain("Monday: 10:00 to 20:00");
    expect(k).not.toContain("Sunday");
    expect(k).toContain("- Basmati rice 5kg (item): ₹640 per bag");
    expect(k).toContain("Home delivery (service): price on request");
  });
  it("gives the customer's unpaid bill with its pay link, and how to pay", () => {
    expect(k).toContain("Bill B12: ₹1328, pay here: https://www.sendkar.shop/p/abc123");
    expect(k).toContain("UPI ID sharma@okhdfcbank");
    expect(k).toContain("Rajesh");
  });
  it("says so plainly when there are no items, no way to pay and no bills", () => {
    const empty = buildKnowledge({ ...base, items: [], payUpi: undefined, unpaid: [], hours: [] });
    expect(empty).toContain("none listed. Do not quote any price");
    expect(empty).toContain("not set up");
    expect(empty).toContain("no unpaid bills");
    expect(empty).not.toContain("Opening hours");
  });
  it("does not run away on a very long list", () => {
    const many = Array.from({ length: 200 }, (_, i) => ({ kind: "item" as const, name: "Item " + i, price: i, unit: null, description: null }));
    expect(buildKnowledge({ ...base, items: many })).toContain("and 140 more");
  });
});

describe("hoursText", () => {
  it("is empty when no day has hours", () => {
    expect(hoursText([{ day_of_week: 2, opens_at: null, closes_at: null }])).toBe("");
  });
});

describe("buildAssistantPrompt", () => {
  const p = buildAssistantPrompt(buildKnowledge(base), [{ direction: "inbound", body: "hi" }], "Rajesh");
  it("tells it to answer in the customer's language and stay inside what it knows", () => {
    expect(p).toContain("same language and script the customer used");
    expect(p).toContain("use only this, never invent anything");
    expect(p).toContain("Only quote a price that is in the list");
  });
  it("includes the conversation and the strict JSON shape", () => {
    expect(p).toContain("Customer: hi");
    expect(p).toContain('"handOff"');
    expect(p).toContain("Never fill \"order\" before they confirm");
  });
});

describe("parseAssistantReply", () => {
  it("reads a plain reply", () => {
    expect(parseAssistantReply('{"reply":"Hello Rajesh!","handOff":false,"order":null}')).toEqual({ reply: "Hello Rajesh!", handOff: false, order: null });
  });
  it("reads fenced JSON and an order, cleaning it", () => {
    const r = parseAssistantReply('```json\n{"reply":"Noted","handOff":false,"order":{"items":[{"name":" Basmati  rice 5kg ","qty":2},{"name":"","qty":1},{"name":"Bad","qty":-1},{"name":"Huge","qty":5000}],"note":"morning"}}\n```');
    expect(r.order).toEqual({ items: [{ name: "Basmati rice 5kg", qty: 2 }], note: "morning" });
  });
  it("ignores an order with no valid items", () => {
    expect(parseAssistantReply('{"reply":"ok","handOff":false,"order":{"items":[],"note":""}}').order).toBeNull();
  });
  it("only hands off when it says true", () => {
    expect(parseAssistantReply('{"reply":"ok","handOff":"yes"}').handOff).toBe(false);
    expect(parseAssistantReply('{"reply":"ok","handOff":true}').handOff).toBe(true);
  });
  it("refuses unreadable or empty answers", () => {
    expect(() => parseAssistantReply("hello there")).toThrow();
    expect(() => parseAssistantReply('{"reply":"  "}')).toThrow();
  });
  it("caps a runaway reply", () => {
    expect(parseAssistantReply(JSON.stringify({ reply: "x".repeat(5000) })).reply.length).toBe(900);
  });
});

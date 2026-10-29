import { describe, it, expect } from "vitest";
import { parseMessageEchoes, parseContactSync, parseHistory, parseAccountUpdate, describeMessage, unixToIso } from "./coexistence";

describe("unixToIso", () => {
  it("reads Meta's unix-seconds strings", () => expect(unixToIso("1700000000")).toBe("2023-11-14T22:13:20.000Z"));
  it("falls back to now for junk", () => {
    const fallback = new Date("2026-10-29T00:00:00Z");
    expect(unixToIso("soon", fallback)).toBe(fallback.toISOString());
    expect(unixToIso(undefined, fallback)).toBe(fallback.toISOString());
  });
});

describe("describeMessage", () => {
  it("returns text bodies", () => expect(describeMessage({ type: "text", text: { body: "hi" } })).toBe("hi"));
  it("keeps media captions", () => expect(describeMessage({ type: "image", image: { caption: "Price list" } })).toBe("[image] Price list"));
  it("falls back to a placeholder", () => {
    expect(describeMessage({ type: "audio", audio: {} })).toBe("[audio message]");
    expect(describeMessage({})).toBe("[unsupported message]");
  });
});

describe("parseMessageEchoes", () => {
  it("turns app-sent messages into outbound rows keyed by the customer", () => {
    const rows = parseMessageEchoes({
      message_echoes: [{ from: "919825000000", to: "+91 98250 12345", id: "wamid.A", timestamp: "1700000000", type: "text", text: { body: "Your order is ready" } }],
    });
    expect(rows).toEqual([
      { id: "wamid.A", customerPhone: "919825012345", direction: "outbound", body: "Your order is ready", sentAt: "2023-11-14T22:13:20.000Z", status: "sent" },
    ]);
  });
  it("skips entries with no id or recipient, and tolerates garbage", () => {
    expect(parseMessageEchoes({ message_echoes: [{ to: "919825012345" }, { id: "x" }, "nope", null] })).toEqual([]);
    expect(parseMessageEchoes(null)).toEqual([]);
    expect(parseMessageEchoes({})).toEqual([]);
  });
});

describe("parseContactSync", () => {
  it("reads added and removed contacts", () => {
    const rows = parseContactSync({
      state_sync: [
        { type: "contact", contact: { full_name: "Patel Textiles", first_name: "Patel", phone_number: "919825012345" }, action: "add" },
        { type: "contact", contact: { phone_number: "919825099999" }, action: "remove" },
      ],
    });
    expect(rows).toEqual([
      { phone: "919825012345", name: "Patel Textiles", action: "add" },
      { phone: "919825099999", name: null, action: "remove" },
    ]);
  });
  it("ignores non-contact syncs and numberless contacts", () => {
    expect(parseContactSync({ state_sync: [{ type: "other" }, { type: "contact", contact: { full_name: "No number" } }] })).toEqual([]);
  });
});

describe("parseHistory", () => {
  const payload = {
    history: [
      {
        metadata: { phase: 1, chunk_order: 1, progress: 40 },
        threads: [
          {
            id: "919825012345",
            messages: [
              { from: "919825012345", id: "wamid.IN", timestamp: "1700000000", type: "text", text: { body: "Price?" }, history_context: { status: "READ" } },
              { from: "919825000000", id: "wamid.OUT", timestamp: "1700000100", type: "text", text: { body: "₹500" }, history_context: { status: "DELIVERED" } },
              { from: "919825000000", id: "wamid.ERR", timestamp: "1700000200", type: "text", text: { body: "Hello?" }, history_context: { status: "ERROR" } },
            ],
          },
        ],
      },
    ],
  };

  it("derives direction from the thread's customer number and maps statuses", () => {
    const r = parseHistory(payload);
    expect(r.progress).toBe(40);
    expect(r.phase).toBe(1);
    expect(r.declined).toBe(false);
    expect(r.messages.map((m) => [m.id, m.direction, m.status])).toEqual([
      ["wamid.IN", "inbound", "delivered"],
      ["wamid.OUT", "outbound", "delivered"],
      ["wamid.ERR", "outbound", "failed"],
    ]);
  });
  it("detects a business that declined to share history", () => {
    expect(parseHistory({ errors: [{ code: 2593109 }] }).declined).toBe(true);
    expect(parseHistory({ history: [{ errors: [{ code: 2593109 }] }] }).declined).toBe(true);
  });
  it("tolerates empty and malformed payloads", () => {
    expect(parseHistory(undefined).messages).toEqual([]);
    expect(parseHistory({ history: [{ threads: [{ messages: [{ id: "x" }] }] }] }).messages).toEqual([]);
  });
});

describe("parseAccountUpdate", () => {
  it("flags a removed partner as a disconnect", () => {
    expect(parseAccountUpdate({ event: "PARTNER_REMOVED", disconnection_info: { reason: "Number moved", initiated_by: "business" } })).toEqual({
      event: "PARTNER_REMOVED",
      disconnected: true,
      reason: "Number moved",
    });
  });
  it("does not flag ordinary updates", () => {
    expect(parseAccountUpdate({ event: "ACCOUNT_REVIEW_UPDATE" }).disconnected).toBe(false);
    expect(parseAccountUpdate(undefined).disconnected).toBe(false);
  });
});

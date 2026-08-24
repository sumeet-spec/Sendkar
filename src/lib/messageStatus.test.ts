import { describe, it, expect } from "vitest";
import { isStatusRegression } from "./messageStatus";

describe("isStatusRegression", () => {
  it("has nothing to regress from when there's no prior status", () => {
    expect(isStatusRegression(null, "delivered")).toBe(false);
  });

  it("ignores an unrecognized prior status", () => {
    expect(isStatusRegression("queued", "sent")).toBe(false);
  });

  it("blocks a late 'sent' arriving after 'delivered'", () => {
    expect(isStatusRegression("delivered", "sent")).toBe(true);
  });

  it("blocks a late 'delivered' arriving after 'read'", () => {
    expect(isStatusRegression("read", "delivered")).toBe(true);
  });

  it("allows forward progress sent -> delivered -> read", () => {
    expect(isStatusRegression("sent", "delivered")).toBe(false);
    expect(isStatusRegression("delivered", "read")).toBe(false);
  });

  it("allows a same-rank repeat (an at-least-once retry of the same event)", () => {
    expect(isStatusRegression("delivered", "delivered")).toBe(false);
  });

  it("blocks 'failed' arriving after the message was already delivered or read", () => {
    expect(isStatusRegression("delivered", "failed")).toBe(true);
    expect(isStatusRegression("read", "failed")).toBe(true);
  });

  it("allows 'failed' when nothing better has landed yet", () => {
    expect(isStatusRegression("sent", "failed")).toBe(false);
  });
});

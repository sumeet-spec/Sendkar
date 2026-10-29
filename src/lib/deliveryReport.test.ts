import { describe, it, expect } from "vitest";
import { buildReport, failureKind } from "./deliveryReport";

describe("failureKind", () => {
  it("recognises the reasons we write ourselves", () => {
    expect(failureKind("Contact opted out")).toBe("optedOut");
    expect(failureKind("Contact has no phone number")).toBe("noPhone");
    expect(failureKind("This template needs a picture. Add a card to the campaign.")).toBe("needsPicture");
  });
  it("recognises Meta's not-on-WhatsApp wording", () => {
    expect(failureKind("(#131026) Message undeliverable")).toBe("notOnWhatsApp");
  });
  it("recognises Meta's rate limits", () => {
    expect(failureKind("(#130429) Rate limit hit")).toBe("limit");
  });
  it("falls back to other", () => {
    expect(failureKind("Something odd")).toBe("other");
    expect(failureKind(null)).toBe("other");
  });
});

describe("buildReport", () => {
  it("counts progress, people reached and groups failures biggest first", () => {
    const r = buildReport({ queued: 50, sent: 20, delivered: 300, read: 100, failed: 30 }, [
      ...Array(20).fill("Message undeliverable"), ...Array(10).fill("Contact opted out"),
    ]);
    expect(r.total).toBe(500);
    expect(r.percentDone).toBe(90);
    expect(r.gotIt).toBe(400);
    expect(r.stillWaiting).toBe(50);
    expect(r.failed.map((f) => [f.kind, f.count])).toEqual([["notOnWhatsApp", 20], ["optedOut", 10]]);
  });

  it("puts failures beyond the listed errors under other, so the numbers always add up", () => {
    const r = buildReport({ queued: 0, sent: 0, delivered: 0, read: 0, failed: 5 }, ["Contact opted out"]);
    expect(r.failed.reduce((s, f) => s + f.count, 0)).toBe(5);
  });

  it("an empty campaign is 0% and does not divide by zero", () => {
    expect(buildReport({ queued: 0, sent: 0, delivered: 0, read: 0, failed: 0 }, []).percentDone).toBe(0);
  });
});

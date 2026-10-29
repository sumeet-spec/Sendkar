import { describe, it, expect } from "vitest";
import { checkFollowupBody, absoluteDelays, insertByTime, followupTemplateName, OPT_OUT_FOOTER, FOLLOWUP_EXAMPLES } from "./followups";
import { LANGUAGES } from "@/lib/i18n/dictionaries";

describe("checkFollowupBody", () => {
  it("accepts a message with the name and shop in the middle", () => {
    const r = checkFollowupBody("Hello {{1}}, thank you for shopping at {{2}}. Visit us again this week for a special offer.");
    expect(r.ok).toBe(true);
  });
  it("needs both placeholders and refuses others", () => {
    expect(checkFollowupBody("Hello {{1}}, thanks for visiting us last week and for your trust.").ok).toBe(false);
    expect(checkFollowupBody("Hello {{1}} from {{2}}, your code is {{3}} for the next visit here.").ok).toBe(false);
  });
  it("refuses a placeholder at the start or end, or two together", () => {
    expect(checkFollowupBody("{{1}} thank you for shopping at {{2}} with us again soon").ok).toBe(false);
    expect(checkFollowupBody("Thank you for shopping with us again soon, {{1}} and {{2}}").ok).toBe(false);
    expect(checkFollowupBody("Hello {{1}}{{2}} thank you for shopping with us again soon, friend.").ok).toBe(false);
  });
  it("squeezes line breaks into spaces", () => {
    const r = checkFollowupBody("Hello {{1}},\n\nthank you for shopping at {{2}}.\nCome again soon, friend.");
    expect(r.ok && r.body).not.toMatch(/\n/);
  });
});

describe("journey timing", () => {
  it("turns relative delays into time since the bill", () => {
    expect(absoluteDelays([{ delay_minutes: 1440 }, { delay_minutes: 8640 }])).toEqual([1440, 10080]);
  });
  it("places a new step by time and rewrites the relative delays", () => {
    const r = insertByTime([1440, 64800], 10080);
    expect(r.newIndex).toBe(1);
    expect(r.order).toEqual([1440, 8640, 54720]);
  });
  it("puts a step at the end when it is the latest", () => {
    expect(insertByTime([1440], 64800).order).toEqual([1440, 63360]);
  });
});

describe("per-language pieces", () => {
  it("has an opt-out line and examples in every language", () => {
    for (const { code } of LANGUAGES) {
      expect(OPT_OUT_FOOTER[code]).toContain("Stop");
      expect(OPT_OUT_FOOTER[code].length).toBeLessThanOrEqual(60);
      expect(FOLLOWUP_EXAMPLES[code]).toHaveLength(2);
    }
  });
  it("makes a valid Meta template name", () => {
    expect(followupTemplateName("gu", Date.now())).toMatch(/^[a-z0-9_]+$/);
  });
});

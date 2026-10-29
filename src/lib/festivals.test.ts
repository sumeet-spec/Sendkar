import { describe, it, expect } from "vitest";
import { FESTIVALS, todayInIndia, upcomingFestivals } from "./festivals";
import { occasionById } from "./cards/occasions";

describe("festival calendar", () => {
  it("every festival has a card to make for it", () => {
    for (const f of FESTIVALS) expect(occasionById(f.occasion), f.id).toBeDefined();
  });

  it("lists soonest first and counts days correctly", () => {
    const next = upcomingFestivals("2026-10-29", 3);
    expect(next.map((f) => f.id)).toEqual(["dhanteras-2026", "diwali-2026", "bestu-2026"]);
    expect(next[1].daysLeft).toBe(10);
    expect(next[1].stage).toBe("now");
  });

  it("never shows an uncertain date as certain", () => {
    for (const f of FESTIVALS.filter((x) => !x.exact)) {
      const shown = upcomingFestivals(f.date, 1)[0];
      expect(shown.dateLabel, f.id).toMatch(/^around /);
    }
    expect(upcomingFestivals("2026-11-06", 1)[0].dateLabel).toBe("6 Nov");
  });

  it("drops festivals that have passed, and today's still counts", () => {
    expect(upcomingFestivals("2026-11-08", 1)[0].id).toBe("diwali-2026");
    expect(upcomingFestivals("2026-11-09", 1)[0].id).toBe("bestu-2026");
  });

  it("is not about to run dry: needs refreshing before the list gets this short", () => {
    const left = upcomingFestivals(todayInIndia(), 10).length;
    expect(left, "Refresh src/lib/festivals.ts with next year's dates").toBeGreaterThanOrEqual(3);
  });

  it("reads today's date in India, not the server's", () => {
    expect(todayInIndia(new Date("2026-11-07T20:00:00Z"))).toBe("2026-11-08");
  });
});

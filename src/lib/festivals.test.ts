import { describe, it, expect } from "vitest";
import { FESTIVALS, todayInIndia, upcomingFestivals } from "./festivals";
import { occasionById } from "./cards/occasions";

describe("festival calendar", () => {
  it("every festival has a card to make for it", () => {
    for (const f of FESTIVALS) expect(occasionById(f.occasion), f.id).toBeDefined();
  });

  it("lists soonest first and counts days correctly", () => {
    const next = upcomingFestivals("2026-10-29", 3);
    expect(next.map((f) => f.id)).toEqual(["rajyotsava-2026", "dhanteras-2026", "diwali-2026"]);
    expect(next[2].daysLeft).toBe(10);
    expect(next[2].stage).toBe("now");
  });

  it("never shows an uncertain date as certain", () => {
    for (const f of FESTIVALS.filter((x) => !x.exact)) {
      const shown = upcomingFestivals(f.date, 30).find((x) => x.id === f.id)!;
      expect(shown.dateLabel, f.id).toMatch(/^around /);
    }
    expect(upcomingFestivals("2026-11-06", 1)[0].dateLabel).toBe("6 Nov");
  });

  it("drops festivals that have passed, and today's still counts", () => {
    expect(upcomingFestivals("2026-11-08", 1)[0].id).toBe("diwali-2026");
    expect(upcomingFestivals("2026-11-09", 1)[0].id).toBe("bestu-2026");
  });

  it("shows each language the festivals its speakers keep", () => {
    const ids = (lang: "en" | "gu" | "ta" | "kn" | "hi", limit = 30) => upcomingFestivals("2026-10-29", limit, lang).map((f) => f.id);
    expect(ids("gu")).toContain("bestu-2026");
    expect(ids("gu")).toContain("uttarayan-2027");
    expect(ids("gu")).not.toContain("pongal-2027");
    expect(ids("gu")).not.toContain("rajyotsava-2026");
    expect(ids("ta")).toContain("pongal-2027");
    expect(ids("ta")).toContain("puthandu-2027");
    expect(ids("ta")).not.toContain("dhanteras-2026");
    expect(ids("kn")).toContain("rajyotsava-2026");
    expect(ids("hi")).toContain("chhath-2026");
    expect(ids("hi")).not.toContain("bestu-2026");
    // everyone keeps Diwali, Christmas and the national days
    for (const l of ["gu", "ta", "kn", "hi"] as const) for (const id of ["diwali-2026", "christmas-2026", "republic-2027"]) expect(ids(l), `${l} ${id}`).toContain(id);
    // English is the full list
    expect(ids("en").length).toBe(FESTIVALS.filter((f) => f.date >= "2026-10-29").length);
  });

  it("a chosen state adds the festivals kept there, whatever the language", () => {
    const ids = (lang: "hi" | "ta" | "en", state: string | null) => upcomingFestivals("2026-10-29", 40, lang, state as never).map((f) => f.id);
    // a Hindi-speaking shop in Gujarat also sees the Gujarati festivals
    expect(ids("hi", null)).not.toContain("bestu-2026");
    expect(ids("hi", "gujarat")).toContain("bestu-2026");
    expect(ids("hi", "gujarat")).toContain("uttarayan-2027");
    // a Tamil-speaking shop in Karnataka also sees Rajyotsava
    expect(ids("ta", "karnataka")).toContain("rajyotsava-2026");
    expect(ids("ta", null)).not.toContain("rajyotsava-2026");
    // a state does not remove anything the language already brings
    for (const id of ids("hi", null)) expect(ids("hi", "gujarat")).toContain(id);
    // English still shows everything
    expect(ids("en", "gujarat").length).toBe(ids("en", null).length);
  });

  it("every state code used on a festival is a real state", async () => {
    const { STATES } = await import("./festivals");
    const known = new Set(STATES.map((s) => s.code));
    for (const f of FESTIVALS) for (const s of f.states ?? []) expect(known.has(s), `${f.id} ${s}`).toBe(true);
  });

  it("puts designs live 45 days ahead, with a coming-soon date before that", () => {
    const xmas = upcomingFestivals("2026-10-29", 30).find((f) => f.id === "christmas-2026")!;
    expect(xmas.releaseDate).toBe("2026-11-10");
    expect(xmas.released).toBe(false);
    expect(upcomingFestivals("2026-10-29", 30).find((f) => f.id === "diwali-2026")!.released).toBe(true);
    expect(upcomingFestivals("2026-11-10", 30).find((f) => f.id === "christmas-2026")!.released).toBe(true);
  });

  it("is not about to run dry: needs refreshing before the list gets this short", () => {
    const left = upcomingFestivals(todayInIndia(), 10).length;
    expect(left, "Refresh src/lib/festivals.ts with next year's dates").toBeGreaterThanOrEqual(3);
  });

  it("reads today's date in India, not the server's", () => {
    expect(todayInIndia(new Date("2026-11-07T20:00:00Z"))).toBe("2026-11-08");
  });
});

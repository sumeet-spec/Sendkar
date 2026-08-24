import { describe, it, expect } from "vitest";
import { isWithinBusinessHours, type BusinessHoursRow } from "./businessHours";

const MON_10AM_IST = new Date("2026-08-24T04:30:00Z"); // 10:00 IST, a Monday
const MON_11PM_IST = new Date("2026-08-24T17:30:00Z"); // 23:00 IST, same Monday

describe("isWithinBusinessHours", () => {
  it("treats no configured hours as always open", () => {
    expect(isWithinBusinessHours([], "Asia/Kolkata", MON_11PM_IST)).toBe(true);
  });

  it("is open during a configured window", () => {
    const hours: BusinessHoursRow[] = [{ day_of_week: 1, opens_at: "09:00", closes_at: "18:00" }];
    expect(isWithinBusinessHours(hours, "Asia/Kolkata", MON_10AM_IST)).toBe(true);
  });

  it("is closed outside a configured window on the same day", () => {
    const hours: BusinessHoursRow[] = [{ day_of_week: 1, opens_at: "09:00", closes_at: "18:00" }];
    expect(isWithinBusinessHours(hours, "Asia/Kolkata", MON_11PM_IST)).toBe(false);
  });

  it("is closed on a day with no configured window", () => {
    const hours: BusinessHoursRow[] = [{ day_of_week: 2, opens_at: "09:00", closes_at: "18:00" }]; // Tuesday only
    expect(isWithinBusinessHours(hours, "Asia/Kolkata", MON_10AM_IST)).toBe(false);
  });

  it("treats the close time as exclusive", () => {
    const hours: BusinessHoursRow[] = [{ day_of_week: 1, opens_at: "09:00", closes_at: "10:00" }];
    expect(isWithinBusinessHours(hours, "Asia/Kolkata", MON_10AM_IST)).toBe(false);
  });
});

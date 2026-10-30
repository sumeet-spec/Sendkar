import { todayInIndia } from "@/lib/reminders";

/**
 * Birthdays and anniversaries. A date is stored as YYYY-MM-DD; only the month and day matter each year.
 */

export interface MonthDay { month: number; day: number }

/** "1990-03-14" becomes March 14. The year may be a placeholder when the customer only told the shop the day. */
export function monthDay(ymd: string | null | undefined): MonthDay | null {
  const m = ymd?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const month = Number(m[2]);
  const day = Number(m[3]);
  return month >= 1 && month <= 12 && day >= 1 && day <= 31 ? { month, day } : null;
}

/** True when today (in India) is this date's day of the year. A 29 February is celebrated on 28 February in other years. */
export function isOccasionToday(ymd: string | null | undefined, today: string = todayInIndia()): boolean {
  const md = monthDay(ymd);
  const t = monthDay(today);
  if (!md || !t) return false;
  if (md.month === t.month && md.day === t.day) return true;
  const year = Number(today.slice(0, 4));
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return md.month === 2 && md.day === 29 && !leap && t.month === 2 && t.day === 28;
}

export type Occasion = "birthday" | "anniversary";

/** The word that fills the {{2}} slot of the birthday and anniversary wish, in each of the pack's three languages. */
export const OCCASION_WORD: Record<Occasion, Record<"hi" | "gu" | "en", string>> = {
  birthday: { hi: "जन्मदिन", gu: "જન્મદિવસ", en: "birthday" },
  anniversary: { hi: "सालगिरह", gu: "લગ્નની વર્ષગાંઠ", en: "anniversary" },
};

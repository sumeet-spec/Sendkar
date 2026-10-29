import type { OccasionId } from "@/lib/cards/occasions";

/**
 * Festival dates for the "coming up" strip on the card maker.
 *
 * Dates were checked on 29 Oct 2026 against several published Hindu and Indian calendars. Where those
 * calendars disagree by a day (the moon, or the local panchang, decides), `exact` is false and the page
 * says "around ..." and tells the shopkeeper to confirm the day. Never show a guessed date as certain.
 *
 * This list runs to Diwali 2027. Refresh it every autumn: the test below fails once fewer than three
 * festivals are left, so it cannot quietly go empty.
 */
export type Festival = {
  id: string;
  name: string;
  /** The card to make for it. */
  occasion: OccasionId;
  /** First date it could fall on, YYYY-MM-DD. */
  date: string;
  exact: boolean;
  /** Shown instead of the plain date when `exact` is false, e.g. "9 or 10 Nov". */
  around?: string;
};

export const FESTIVALS: Festival[] = [
  { id: "dhanteras-2026", name: "Dhanteras", occasion: "dhanteras", date: "2026-11-06", exact: true },
  { id: "diwali-2026", name: "Diwali", occasion: "diwali", date: "2026-11-08", exact: true },
  { id: "bestu-2026", name: "Gujarati New Year (Bestu Varas)", occasion: "newyear", date: "2026-11-09", exact: false, around: "9 or 10 Nov" },
  { id: "bhaidooj-2026", name: "Bhai Dooj", occasion: "bhaidooj", date: "2026-11-10", exact: false, around: "10 or 11 Nov" },
  { id: "christmas-2026", name: "Christmas", occasion: "christmas", date: "2026-12-25", exact: true },
  { id: "newyear-2027", name: "New Year", occasion: "newyear", date: "2027-01-01", exact: true },
  { id: "pongal-2027", name: "Makar Sankranti / Pongal", occasion: "pongal", date: "2027-01-14", exact: false, around: "14 or 15 Jan" },
  { id: "eid-2027", name: "Eid al-Fitr", occasion: "eid", date: "2027-03-09", exact: false, around: "9 or 10 Mar, after the moon is seen" },
  { id: "holi-2027", name: "Holi", occasion: "holi", date: "2027-03-22", exact: false, around: "22 or 23 Mar" },
  { id: "rakhi-2027", name: "Raksha Bandhan", occasion: "rakhi", date: "2027-08-17", exact: false, around: "17 Aug" },
  { id: "ganesh-2027", name: "Ganesh Chaturthi", occasion: "ganesh", date: "2027-09-03", exact: false, around: "3 or 4 Sep" },
  { id: "navratri-2027", name: "Navratri", occasion: "navratri", date: "2027-09-30", exact: false, around: "starts about 30 Sep" },
  { id: "diwali-2027", name: "Diwali", occasion: "diwali", date: "2027-10-29", exact: true },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type UpcomingFestival = Festival & { daysLeft: number; dateLabel: string; stage: "now" | "soon" | "later" };

function plainDate(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** The next festivals from `today` (a YYYY-MM-DD date in India), soonest first. */
export function upcomingFestivals(today: string, limit = 4): UpcomingFestival[] {
  const t = Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10));
  return FESTIVALS
    .map((f) => {
      const daysLeft = Math.round((Date.UTC(+f.date.slice(0, 4), +f.date.slice(5, 7) - 1, +f.date.slice(8, 10)) - t) / 86_400_000);
      return { ...f, daysLeft, dateLabel: f.exact ? plainDate(f.date) : `around ${f.around ?? plainDate(f.date)}`, stage: daysLeft <= 10 ? ("now" as const) : daysLeft <= 30 ? ("soon" as const) : ("later" as const) };
    })
    .filter((f) => f.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, limit);
}

/** Today's date in India as YYYY-MM-DD. */
export function todayInIndia(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

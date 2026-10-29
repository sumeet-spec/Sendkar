import type { OccasionId } from "@/lib/cards/occasions";
import type { LanguageCode } from "@/lib/i18n/dictionaries";

/**
 * Festival dates for the calendar and the festival library.
 *
 * Dates were checked on 29 Oct 2026 against several published Hindu and Indian calendars. Where those
 * calendars disagree by a day (the moon, or the local panchang, decides), `exact` is false and the page
 * says "around ..." and tells the shopkeeper to confirm the day. Never show a guessed date as certain.
 *
 * Festivals differ by region, so each one lists the languages whose speakers keep it (`langs`). A festival
 * with no `langs` is kept everywhere. Choosing English shows every festival.
 *
 * This list runs to Diwali 2027. Refresh it every autumn: a test fails once fewer than three festivals
 * are left, so it cannot quietly go empty.
 */
export type Festival = {
  id: string;
  name: string;
  /** The card and designs for it. */
  occasion: OccasionId;
  /** First date it could fall on, YYYY-MM-DD. */
  date: string;
  exact: boolean;
  /** Shown instead of the plain date when `exact` is false, e.g. "9 or 10 Nov". */
  around?: string;
  /** Languages whose speakers keep this festival; absent means everywhere. */
  langs?: LanguageCode[];
};

const NORTH_WEST: LanguageCode[] = ["hi", "gu", "mr"];

export const FESTIVALS: Festival[] = [
  { id: "rajyotsava-2026", name: "Kannada Rajyotsava", occasion: "rajyotsava", date: "2026-11-01", exact: true, langs: ["kn"] },
  { id: "dhanteras-2026", name: "Dhanteras", occasion: "dhanteras", date: "2026-11-06", exact: true, langs: NORTH_WEST },
  { id: "diwali-2026", name: "Diwali", occasion: "diwali", date: "2026-11-08", exact: true },
  { id: "bestu-2026", name: "Gujarati New Year (Bestu Varas)", occasion: "newyear", date: "2026-11-09", exact: false, around: "9 or 10 Nov", langs: ["gu"] },
  { id: "bhaidooj-2026", name: "Bhai Dooj", occasion: "bhaidooj", date: "2026-11-10", exact: false, around: "10 or 11 Nov", langs: NORTH_WEST },
  { id: "chhath-2026", name: "Chhath Puja", occasion: "chhath", date: "2026-11-15", exact: false, around: "13 to 16 Nov", langs: ["hi"] },
  { id: "christmas-2026", name: "Christmas", occasion: "christmas", date: "2026-12-25", exact: true },
  { id: "newyear-2027", name: "New Year", occasion: "newyear", date: "2027-01-01", exact: true },
  { id: "uttarayan-2027", name: "Uttarayan", occasion: "uttarayan", date: "2027-01-14", exact: false, around: "14 or 15 Jan", langs: ["gu"] },
  { id: "pongal-2027", name: "Pongal", occasion: "pongal", date: "2027-01-14", exact: false, around: "14 or 15 Jan", langs: ["ta"] },
  { id: "sankranti-2027", name: "Makar Sankranti", occasion: "sankranti", date: "2027-01-14", exact: false, around: "14 or 15 Jan", langs: ["hi", "mr", "te", "kn"] },
  { id: "republic-2027", name: "Republic Day", occasion: "republic", date: "2027-01-26", exact: true },
  { id: "eid-2027", name: "Eid al-Fitr", occasion: "eid", date: "2027-03-09", exact: false, around: "9 or 10 Mar, after the moon is seen" },
  { id: "holi-2027", name: "Holi", occasion: "holi", date: "2027-03-22", exact: false, around: "22 or 23 Mar", langs: ["hi", "gu", "mr", "te", "kn"] },
  { id: "ugadi-2027", name: "Ugadi / Gudi Padwa", occasion: "ugadi", date: "2027-04-07", exact: false, around: "7 Apr", langs: ["mr", "te", "kn"] },
  { id: "puthandu-2027", name: "Tamil New Year (Puthandu)", occasion: "puthandu", date: "2027-04-14", exact: true, langs: ["ta"] },
  { id: "ramnavami-2027", name: "Ram Navami", occasion: "ramnavami", date: "2027-04-14", exact: false, around: "14 or 15 Apr", langs: NORTH_WEST },
  { id: "akshaya-2027", name: "Akshaya Tritiya", occasion: "akshaya", date: "2027-05-08", exact: false, around: "8 or 9 May", langs: NORTH_WEST },
  { id: "independence-2027", name: "Independence Day", occasion: "independence", date: "2027-08-15", exact: true },
  { id: "rakhi-2027", name: "Raksha Bandhan", occasion: "rakhi", date: "2027-08-17", exact: false, around: "17 Aug", langs: ["hi", "gu", "mr", "te", "kn"] },
  { id: "ganesh-2027", name: "Ganesh Chaturthi", occasion: "ganesh", date: "2027-09-03", exact: false, around: "3 or 4 Sep" },
  { id: "navratri-2027", name: "Navratri", occasion: "navratri", date: "2027-09-30", exact: false, around: "starts about 30 Sep" },
  { id: "diwali-2027", name: "Diwali", occasion: "diwali", date: "2027-10-29", exact: true },
];

/** Designs for a festival go live this many days before it, so shops have time to send. */
export const RELEASE_DAYS_BEFORE = 45;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const utc = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));

export type UpcomingFestival = Festival & {
  daysLeft: number;
  dateLabel: string;
  stage: "now" | "soon" | "later";
  /** Date the library designs go live, YYYY-MM-DD. */
  releaseDate: string;
  released: boolean;
};

function plainDate(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

const isoOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** True when this festival is kept by speakers of `lang`. English shows everything. */
export function festivalIsFor(f: Festival, lang: LanguageCode): boolean {
  return lang === "en" || !f.langs || f.langs.includes(lang);
}

/** The next festivals from `today` (a YYYY-MM-DD date in India) for speakers of `lang`, soonest first. */
export function upcomingFestivals(today: string, limit = 4, lang: LanguageCode = "en"): UpcomingFestival[] {
  const t = utc(today);
  return FESTIVALS
    .filter((f) => festivalIsFor(f, lang))
    .map((f) => {
      const daysLeft = Math.round((utc(f.date) - t) / 86_400_000);
      const releaseDate = isoOf(utc(f.date) - RELEASE_DAYS_BEFORE * 86_400_000);
      return {
        ...f, daysLeft, releaseDate, released: today >= releaseDate,
        dateLabel: f.exact ? plainDate(f.date) : `around ${f.around ?? plainDate(f.date)}`,
        stage: daysLeft <= 10 ? ("now" as const) : daysLeft <= 30 ? ("soon" as const) : ("later" as const),
      };
    })
    .filter((f) => f.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, limit);
}

/** Today's date in India as YYYY-MM-DD. */
export function todayInIndia(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export { plainDate as shortDate };

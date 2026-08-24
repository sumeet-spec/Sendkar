/**
 * Business-hours check — pure logic, timezone-aware via Intl (no date
 * library dependency, same minimal-deps posture as the rest of this repo).
 * An empty hours list means "no hours configured" — treated as always open
 * so a workspace that hasn't set anything up yet doesn't silently start
 * telling every customer the business is closed.
 */

export interface BusinessHoursRow {
  day_of_week: number; // 0 = Sunday
  opens_at: string; // "HH:MM:SS" or "HH:MM", as Postgres returns a `time` column
  closes_at: string;
}

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function isWithinBusinessHours(hours: BusinessHoursRow[], timezone: string, now: Date = new Date()): boolean {
  if (hours.length === 0) return true;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const dayOfWeek = WEEKDAY_INDEX[weekday] ?? 0;
  const nowMinutes = Number(hour) * 60 + Number(minute);

  const todaysWindows = hours.filter((h) => h.day_of_week === dayOfWeek);
  if (todaysWindows.length === 0) return false; // hours exist for other days, just not today

  return todaysWindows.some((w) => nowMinutes >= toMinutes(w.opens_at) && nowMinutes < toMinutes(w.closes_at));
}

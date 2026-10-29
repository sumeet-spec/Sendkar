import type { LanguageCode } from "@/lib/i18n/dictionaries";

/**
 * Follow-up messages after a bill. A follow-up is a WhatsApp template the shop's own Meta account approves,
 * then a step in the shop's "after-bill" journey, sent a set time after each bill to customers who agreed to offers.
 */

export const FOLLOWUP_SEQUENCE_NAME = "After-bill follow-ups";
export const FOLLOWUP_TEMPLATE_PREFIX = "sk_followup_";

export const FOLLOWUP_WHEN = [
  { key: "day1", minutes: 24 * 60 },
  { key: "week1", minutes: 7 * 24 * 60 },
  { key: "week6", minutes: 45 * 24 * 60 },
  { key: "month3", minutes: 90 * 24 * 60 },
] as const;
export type FollowupWhen = (typeof FOLLOWUP_WHEN)[number]["key"];

/** The opt-out line Meta needs on promotional messages, in each language. The button next to it sends "Stop". */
export const OPT_OUT_FOOTER: Record<LanguageCode, string> = {
  en: "Reply Stop to opt out", hi: "रोकने के लिए Stop लिखें", mr: "थांबवण्यासाठी Stop लिहा", gu: "બંધ કરવા Stop લખો",
  ta: "நிறுத்த Stop என அனுப்புங்கள்", te: "ఆపడానికి Stop అని పంపండి", kn: "ನಿಲ್ಲಿಸಲು Stop ಎಂದು ಕಳುಹಿಸಿ",
};

/** Same examples Meta's reviewers see: a believable name and shop in the message's own script. */
export const FOLLOWUP_EXAMPLES: Record<LanguageCode, [string, string]> = {
  en: ["Rajesh", "Sharma Traders"], hi: ["राजेश", "शर्मा ट्रेडर्स"], mr: ["राजेश", "शर्मा ट्रेडर्स"], gu: ["રાજેશ", "શર્મા ટ્રેડર્સ"],
  ta: ["ராஜேஷ்", "ஷர்மா டிரேடர்ஸ்"], te: ["రాజేష్", "శర్మ ట్రేడర్స్"], kn: ["ರಾಜೇಶ್", "ಶರ್ಮಾ ಟ್ರೇಡರ್ಸ್"],
};

export type BodyCheck = { ok: true; body: string } | { ok: false; reason: string };

/**
 * Meta's rules for a template body with {{1}} (customer's name) and {{2}} (shop name): both must appear, neither
 * may start or end the message or sit next to the other, no line breaks, and enough plain words around them.
 */
export function checkFollowupBody(raw: string): BodyCheck {
  const body = raw.replace(/\s+/g, " ").trim();
  if (!body) return { ok: false, reason: "The message is empty." };
  if (body.length > 600) return { ok: false, reason: "Keep the message under 600 characters." };
  const vars = [...body.matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]));
  if (!vars.includes(1)) return { ok: false, reason: "The message must greet the customer by name: it needs {{1}}." };
  if (!vars.includes(2)) return { ok: false, reason: "The message must include the shop name: it needs {{2}}." };
  if (vars.some((v) => v !== 1 && v !== 2)) return { ok: false, reason: "Only {{1}} (name) and {{2}} (shop name) can be used." };
  if (body.startsWith("{{") || body.endsWith("}}")) return { ok: false, reason: "The message cannot start or end with a name placeholder." };
  if (/\}\}\s*\{\{/.test(body)) return { ok: false, reason: "Two placeholders cannot sit side by side." };
  const words = body.replace(/\{\{\d+\}\}/g, "").split(/\s+/).filter(Boolean).length;
  if (words < vars.length * 3) return { ok: false, reason: "Add a few more words around the placeholders." };
  return { ok: true, body };
}

/** Meta template name for one follow-up: lowercase letters, digits and underscores. */
export function followupTemplateName(lang: LanguageCode, stamp: number): string {
  return `${FOLLOWUP_TEMPLATE_PREFIX}${lang}_${stamp.toString(36)}`;
}

export interface StepLike { id?: string; delay_minutes: number; template_id: string | null }

/** Delays in the journey are each relative to the step before. This turns them into time since the bill. */
export function absoluteDelays(steps: Array<{ delay_minutes: number }>): number[] {
  let t = 0;
  return steps.map((s) => (t += s.delay_minutes));
}

/** Puts a new step among existing ones by time since the bill, and returns every step's relative delay again. */
export function insertByTime(existing: number[], newAbsolute: number): { order: number[]; newIndex: number } {
  const all = [...existing.map((abs, i) => ({ abs, i })), { abs: newAbsolute, i: -1 }].sort((a, b) => a.abs - b.abs || (a.i === -1 ? 1 : -1));
  let prev = 0;
  const order = all.map((x) => { const d = x.abs - prev; prev = x.abs; return d; });
  return { order, newIndex: all.findIndex((x) => x.i === -1) };
}

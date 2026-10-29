import { postMessages } from "@/lib/aiModel";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";

const NAMES: Record<LanguageCode, string> = {
  en: "English", hi: "Hindi", mr: "Marathi", ta: "Tamil", te: "Telugu", kn: "Kannada", gu: "Gujarati",
};

const SCRIPT: Partial<Record<LanguageCode, RegExp>> = {
  hi: /[ऀ-ॿ]/, mr: /[ऀ-ॿ]/, gu: /[઀-૿]/, ta: /[஀-௿]/, te: /[ఀ-౿]/, kn: /[ಀ-೿]/,
};

/** True when `text` really is written in `lang`'s own script (English always passes). Guards against the model answering in the wrong language. */
export function looksLike(lang: LanguageCode, text: string): boolean {
  const re = SCRIPT[lang];
  return re ? re.test(text) : text.trim().length > 0;
}

/** Pulls the {"hi": "...", ...} object out of a model reply, tolerating code fences and chatter around it. */
export function parseTranslations(reply: string, langs: LanguageCode[]): Partial<Record<LanguageCode, string>> {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start < 0 || end <= start) return {};
  let obj: Record<string, unknown>;
  try { obj = JSON.parse(reply.slice(start, end + 1)); } catch { return {}; }
  const out: Partial<Record<LanguageCode, string>> = {};
  for (const l of langs) {
    const v = obj[l];
    if (typeof v === "string" && v.trim() && v.length <= 200 && looksLike(l, v)) out[l] = v.trim();
  }
  return out;
}

/**
 * Translates a short shop offer ("15% off till Sunday") into each language, so one campaign can carry a card
 * in every customer's language. Numbers, prices and dates are kept as written. Returns only the languages
 * that came back usable; the caller decides what to do about the rest.
 */
export async function translateLine(text: string, langs: LanguageCode[]): Promise<Partial<Record<LanguageCode, string>>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const targets = langs.filter((l) => LANGUAGES.some((x) => x.code === l));
  if (!apiKey || targets.length === 0) return {};
  const res = await postMessages(apiKey, {
    max_tokens: 700,
    system: "You translate short shop offers for greeting cards in India. Keep numbers, prices, percentages and dates exactly as written. Use the natural, simple wording a shopkeeper would use, not formal or literary language. Reply with ONLY a JSON object mapping each language code to the translation.",
    messages: [{ role: "user", content: `Translate this into ${targets.map((l) => `${NAMES[l]} (${l})`).join(", ")}:\n\n${text}` }],
  }, 20_000).catch(() => null);
  if (!res?.ok) return {};
  const json = (await res.json().catch(() => null)) as { content?: Array<{ type: string; text?: string }> } | null;
  const reply = json?.content?.find((c) => c.type === "text")?.text ?? "";
  return parseTranslations(reply, targets);
}

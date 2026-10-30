import type { LanguageCode } from "@/lib/i18n/dictionaries";

/** The first words a customer's WhatsApp is filled with when they scan the chat QR. The assistant answers in the language it sees. */
export const CHAT_GREETING: Record<LanguageCode, string> = {
  en: "Hi", hi: "नमस्ते", mr: "नमस्कार", gu: "નમસ્તે", ta: "வணக்கம்", te: "నమస్తే", kn: "ನಮಸ್ಕಾರ",
};

/** Digits only, with the country code: 98765 43210 becomes 919876543210. Null when it cannot be a real number. */
export function chatDigits(displayNumber: string): string | null {
  let d = displayNumber.replace(/\D/g, "");
  if (d.length === 10 && /^[6-9]/.test(d)) d = `91${d}`;
  if (d.length === 11 && d.startsWith("0")) d = `91${d.slice(1)}`;
  return d.length >= 11 && d.length <= 15 ? d : null;
}

/** A link that opens a WhatsApp chat with the shop and a greeting ready to send. */
export function chatUrl(displayNumber: string, lang: LanguageCode): string | null {
  const d = chatDigits(displayNumber);
  return d ? `https://wa.me/${d}?text=${encodeURIComponent(CHAT_GREETING[lang])}` : null;
}

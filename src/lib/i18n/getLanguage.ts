import { cookies } from "next/headers";
import { LANGUAGES, type LanguageCode } from "./dictionaries";

export const UI_LANGUAGE_COOKIE = "sk_ui_lang";

const VALID_CODES = new Set(LANGUAGES.map((l) => l.code));

export async function getCurrentLanguage(): Promise<LanguageCode> {
  const cookieStore = await cookies();
  const value = cookieStore.get(UI_LANGUAGE_COOKIE)?.value;
  return value && VALID_CODES.has(value as LanguageCode) ? (value as LanguageCode) : "en";
}

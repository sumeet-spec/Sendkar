"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { UI_LANGUAGE_COOKIE } from "./getLanguage";
import type { LanguageCode } from "./dictionaries";

export async function setUiLanguage(lang: LanguageCode) {
  const cookieStore = await cookies();
  cookieStore.set(UI_LANGUAGE_COOKIE, lang, { maxAge: 60 * 60 * 24 * 365, path: "/" });
  revalidatePath("/", "layout");
}

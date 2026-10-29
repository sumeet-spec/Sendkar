import type { Metadata } from "next";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import { FREE_CARD_COPY } from "@/lib/i18n/freeCardCopy";
import { todayInIndia, upcomingFestivals } from "@/lib/festivals";
import { festivalName } from "@/lib/festivalNames";
import { designsFor } from "@/lib/cards/designs";
import { FreeCardMaker, type FreeFestival } from "./FreeCardMaker";

export const metadata: Metadata = {
  title: "Free festival card for your shop",
  description: "Make a free Diwali, Navratri, Eid or Christmas card with your shop name in Gujarati, Hindi, Marathi, Tamil, Telugu or Kannada. No signup. Share it on WhatsApp.",
};

export default async function FreeCardPage({ searchParams }: { searchParams: Promise<{ lang?: string; src?: string; festival?: string }> }) {
  const { lang: langParam, src, festival } = await searchParams;
  const lang = (LANGUAGES.find((l) => l.code === langParam)?.code ?? "gu") as LanguageCode;

  // Only festivals whose designs are already out, for the people who keep them.
  const festivals: FreeFestival[] = upcomingFestivals(todayInIndia(), 12, lang)
    .filter((f) => f.released)
    .slice(0, 8)
    .map((f) => ({ id: f.id, name: festivalName(f.id, f.name, lang), designs: designsFor(f.occasion).map((d) => d.id) }));
  // Between festivals there is still something useful to make.
  if (festivals.length === 0) festivals.push({ id: "any-sale", name: "Offer", designs: designsFor("sale").map((d) => d.id) });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <FreeCardMaker lang={lang} t={FREE_CARD_COPY[lang]} festivals={festivals} initialFestival={festival ?? null} src={src ?? ""} />
    </main>
  );
}

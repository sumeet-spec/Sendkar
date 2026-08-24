import type { CarouselCard } from "@/lib/whatsapp";

// Plain data parsing, not a server action — lives outside templates/actions.ts
// (a "use server" file, which can only export async functions) so it stays
// unit-testable on its own.

/** One card per line: "media handle | body text | button1, button2" — buttons are optional. */
export function parseCarouselCards(raw: string): CarouselCard[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [headerHandle, bodyText, buttonsRaw] = line.split("|").map((s) => s.trim());
      if (!headerHandle || !bodyText) return null;
      const buttons = buttonsRaw ? buttonsRaw.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 2).map((text) => ({ type: "QUICK_REPLY" as const, text })) : undefined;
      const card: CarouselCard = { headerHandle, bodyText, buttons };
      return card;
    })
    .filter((c): c is CarouselCard => c !== null);
}

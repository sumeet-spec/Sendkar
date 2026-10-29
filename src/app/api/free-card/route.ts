import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { renderCardPng } from "@/lib/cards/renderCard";
import { brandPalette, designById } from "@/lib/cards/designs";
import { occasionById } from "@/lib/cards/occasions";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { FREE_CARD_COLOURS } from "@/lib/freeCard";

export const runtime = "nodejs";

/**
 * A festival card with a shop's name on it, for anyone, no account. The words are drawn by Sendkar (never by an
 * AI), a small "Made with Sendkar" line sits at the bottom, and nothing is stored except, when a card is
 * downloaded, a row counting it.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const design = designById(q.get("design") ?? "");
  const name = (q.get("name") ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 40);
  if (!design || !name) return NextResponse.json({ error: "Pick a design and type your shop name." }, { status: 400 });

  const lang = LANGUAGES.find((l) => l.code === q.get("lang"))?.code ?? "gu";
  const line = (q.get("line") ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 100) || undefined;
  const download = q.get("dl") === "1";
  const size = download ? 1080 : Math.min(640, Math.max(240, Number(q.get("size")) || 480));
  const colour = FREE_CARD_COLOURS.find((c) => c.key === q.get("c"));

  // Rendering takes a little server time, so one visitor can only ask for so many in an hour.
  const ip = await getClientIp();
  if (await isRateLimited(`freecard:${ip}`, download ? 30 : 200, 3600)) return NextResponse.json({ error: "Too many cards just now. Try again in a little while." }, { status: 429 });

  const palette = colour?.primary ? brandPalette(colour.primary, "#fcd34d") : design.palette;
  const png = renderCardPng({
    lang,
    headline: occasionById(design.occasion)!.label[lang],
    line,
    businessName: name,
    primaryColor: colour?.primary ?? "#14532d",
    accentColor: "#fcd34d",
    size,
    design: { motif: design.motif, variant: design.variant, palette },
    watermark: "Made with Sendkar · sendkar.shop",
  });

  if (download) {
    // Count the card; never let a counting problem stop the download.
    void createAdminClient().from("free_card_leads").insert({ shop_name: name, lang, design_id: design.id, source: (q.get("src") ?? "").slice(0, 40) || null });
  }

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": download ? "no-store" : "public, max-age=3600",
      ...(download ? { "Content-Disposition": `attachment; filename="${design.occasion}-card.png"` } : {}),
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rateLimit";
import { generateWorkspaceImage } from "@/lib/aiImage";
import { renderCardPng } from "@/lib/cards/renderCard";
import { occasionById } from "@/lib/cards/occasions";
import { designById } from "@/lib/cards/designs";
import { designInput } from "@/lib/cards/designRender";
import { contactLine, nameFor, DEFAULT_ACCENT, DEFAULT_PRIMARY, sniffImage, type BrandKit } from "@/lib/brandKit";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";
import { translateLine } from "@/lib/translateLine";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  workspaceId?: string;
  occasion?: string;
  /** One language, for a single card. */
  lang?: string;
  /** Several languages, for one card per customer language (same occasion, offer translated for each). */
  langs?: string[];
  headline?: string;
  line?: string;
  withBackground?: boolean;
  /** A ready-made design from the festival library. */
  designId?: string;
  /** "festival" keeps the design's own colours; "brand" repaints it in the shop's colours. */
  colourMode?: string;
};

/** Fetches one of our own stored images. Refuses any other host so a stored URL can never be used to reach elsewhere. */
async function fetchOwnImage(url: string | null): Promise<{ bytes: Buffer; mime: string } | undefined> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !base || !url.startsWith(`${base}/storage/`)) return undefined;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return undefined;
    const bytes = Buffer.from(await res.arrayBuffer());
    const kind = sniffImage(bytes);
    return kind ? { bytes, mime: kind.mime } : undefined;
  } catch {
    return undefined;
  }
}

const codeOf = (v: string | undefined) => LANGUAGES.find((l) => l.code === v)?.code as LanguageCode | undefined;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  const { workspaceId } = body;
  if (!workspaceId) return NextResponse.json({ error: "Missing workspaceId." }, { status: 400 });

  const { data: member } = await supabase
    .from("workspace_members").select("id").eq("workspace_id", workspaceId).eq("user_id", user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const multi = Array.isArray(body.langs) && body.langs.length > 0;
  const langs: LanguageCode[] = multi
    ? [...new Set(body.langs!.map(codeOf).filter((l): l is LanguageCode => Boolean(l)))].slice(0, LANGUAGES.length)
    : [codeOf(body.lang)].filter((l): l is LanguageCode => Boolean(l));
  if (langs.length === 0) return NextResponse.json({ error: "Choose a language." }, { status: 400 });

  const design = body.designId ? designById(body.designId) : undefined;
  if (body.designId && !design) return NextResponse.json({ error: "That design is not available." }, { status: 404 });
  const occasion = design ? occasionById(design.occasion) : body.occasion ? occasionById(body.occasion) : undefined;
  const customHeadline = body.headline?.trim().slice(0, 80) || "";
  // A heading typed by the shop is in one language only, so it cannot be used for several languages.
  if (multi && langs.length > 1 && customHeadline) {
    return NextResponse.json({ error: "Pick an occasion for cards in several languages. A heading you write yourself works for one language." }, { status: 400 });
  }
  if (!customHeadline && !occasion) return NextResponse.json({ error: "Pick an occasion or write what the card should say." }, { status: 400 });
  const line = body.line?.trim().slice(0, 120) || undefined;

  // Cards without a picture cost nothing, but each render still uses server time.
  if (await isRateLimited(`cardrender:${workspaceId}`, 60, 3600)) {
    return NextResponse.json({ error: "Too many cards just now. Try again in a little while." }, { status: 429 });
  }

  const admin = createAdminClient();
  const { data: kitRow } = await admin.from("brand_kits").select("*").eq("workspace_id", workspaceId).maybeSingle();
  const kit = kitRow as BrandKit | null;
  if (!kit || !kit.name.trim()) {
    return NextResponse.json({ error: "Set up your brand kit first: add your shop name, logo and colours.", needsBrandKit: true }, { status: 409 });
  }

  // The offer is written in one language; for several cards it is translated, and any language that cannot be
  // translated reliably is left out and reported, never shown with the wrong script.
  const lines: Partial<Record<LanguageCode, string | undefined>> = {};
  const skipped: LanguageCode[] = [];
  if (line && langs.length > 1) {
    const translated = await translateLine(line, langs);
    for (const l of langs) {
      if (translated[l]) lines[l] = translated[l];
      else skipped.push(l);
    }
  } else {
    for (const l of langs) lines[l] = line;
  }
  const makeFor = langs.filter((l) => !skipped.includes(l));
  if (makeFor.length === 0) return NextResponse.json({ error: "Could not translate your offer. Make the cards one language at a time instead." }, { status: 502 });

  const logo = await fetchOwnImage(kit.logo_url);

  // One picture behind all the cards: a single image charge however many languages.
  let background: { bytes: Buffer; mime: string } | undefined;
  let imagesRemaining: number | undefined;
  let refund: (() => Promise<void>) | undefined;
  // A library design brings its own artwork, so no AI picture (and no image charge) is used with one.
  if (body.withBackground && !design) {
    const scene = occasion?.scene ?? "soft abstract colour shapes";
    const prompt = `A square, text-free background picture for a shop's greeting card: ${scene}. Leave the centre calm and uncluttered. No text, no letters, no numbers, no logos, no people.`;
    const result = await generateWorkspaceImage(admin, workspaceId, prompt, "1:1");
    if (!result.ok) return NextResponse.json({ error: result.error, limit: result.limit, remaining: result.remaining }, { status: result.status });
    background = { bytes: result.bytes, mime: sniffImage(result.bytes)?.mime ?? "image/jpeg" };
    imagesRemaining = result.remaining;
    refund = result.refund;
  }

  const urls: Partial<Record<LanguageCode, string>> = {};
  try {
    const stamp = Date.now();
    for (const lang of makeFor) {
      const png = renderCardPng({
        lang,
        headline: customHeadline || occasion!.label[lang],
        line: lines[lang],
        businessName: nameFor(kit, lang),
        tagline: kit.tagline || undefined,
        contact: contactLine(kit) || undefined,
        primaryColor: kit.primary_color || DEFAULT_PRIMARY,
        accentColor: kit.accent_color || DEFAULT_ACCENT,
        logo,
        background,
        design: design ? designInput(design, body.colourMode === "brand" ? "brand" : "festival", { primary: kit.primary_color || DEFAULT_PRIMARY, accent: kit.accent_color || DEFAULT_ACCENT }) : undefined,
      });
      const path = `cards/${workspaceId}/${stamp}-${lang}.png`;
      const { error: uploadError } = await admin.storage.from("campaign-images").upload(path, png, { contentType: "image/png", upsert: false });
      if (uploadError) throw new Error("upload");
      urls[lang] = admin.storage.from("campaign-images").getPublicUrl(path).data.publicUrl;
    }
  } catch {
    await refund?.();
    return NextResponse.json({ error: "Could not make the cards. Please try again." }, { status: 500 });
  }

  // `url` stays for the single-card screen; `urls` and `lines` are for the one-per-language mode.
  // Keep every card so it can be sent again. Best effort: a failure here must never lose the card just made.
  await admin.from("saved_cards").insert({
    workspace_id: workspaceId,
    title: customHeadline || occasion?.label.en || "",
    occasion: occasion?.id ?? null,
    design_id: design?.id ?? null,
    url: urls[makeFor[0]],
    urls: makeFor.length > 1 ? urls : null,
  });

  return NextResponse.json({ url: urls[makeFor[0]], urls, lines, skipped, imagesRemaining });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rateLimit";
import { generateWorkspaceImage } from "@/lib/aiImage";
import { renderCardPng } from "@/lib/cards/renderCard";
import { occasionById } from "@/lib/cards/occasions";
import { contactLine, nameFor, DEFAULT_ACCENT, DEFAULT_PRIMARY, sniffImage, type BrandKit } from "@/lib/brandKit";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/dictionaries";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  workspaceId?: string;
  occasion?: string;
  lang?: string;
  headline?: string;
  line?: string;
  withBackground?: boolean;
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

  const lang = LANGUAGES.find((l) => l.code === body.lang)?.code as LanguageCode | undefined;
  if (!lang) return NextResponse.json({ error: "Choose a language." }, { status: 400 });

  const occasion = body.occasion ? occasionById(body.occasion) : undefined;
  const headline = (body.headline?.trim() || occasion?.label[lang] || "").slice(0, 80);
  if (!headline) return NextResponse.json({ error: "Pick an occasion or write what the card should say." }, { status: 400 });
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

  const logo = await fetchOwnImage(kit.logo_url);

  let background: { bytes: Buffer; mime: string } | undefined;
  let imagesRemaining: number | undefined;
  let refund: (() => Promise<void>) | undefined;
  if (body.withBackground) {
    // The picture model only ever paints a background. Every word on the card is drawn by us.
    const scene = occasion?.scene ?? "soft abstract colour shapes";
    const prompt = `A square, text-free background picture for a shop's greeting card: ${scene}. Leave the centre calm and uncluttered. No text, no letters, no numbers, no logos, no people.`;
    const result = await generateWorkspaceImage(admin, workspaceId, prompt, "1:1");
    if (!result.ok) return NextResponse.json({ error: result.error, limit: result.limit, remaining: result.remaining }, { status: result.status });
    background = { bytes: result.bytes, mime: sniffImage(result.bytes)?.mime ?? "image/jpeg" };
    imagesRemaining = result.remaining;
    refund = result.refund;
  }

  let png: Buffer;
  try {
    png = renderCardPng({
      lang,
      headline,
      line,
      businessName: nameFor(kit, lang),
      tagline: kit.tagline || undefined,
      contact: contactLine(kit) || undefined,
      primaryColor: kit.primary_color || DEFAULT_PRIMARY,
      accentColor: kit.accent_color || DEFAULT_ACCENT,
      logo,
      background,
    });
  } catch {
    await refund?.();
    return NextResponse.json({ error: "Could not draw the card. Please try again." }, { status: 500 });
  }

  const path = `cards/${workspaceId}/${Date.now()}.png`;
  const { error: uploadError } = await admin.storage.from("campaign-images").upload(path, png, { contentType: "image/png", upsert: false });
  if (uploadError) {
    await refund?.();
    return NextResponse.json({ error: "Could not save the card. Please try again." }, { status: 500 });
  }
  const { data: { publicUrl } } = admin.storage.from("campaign-images").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl, imagesRemaining });
}

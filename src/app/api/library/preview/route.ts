import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { memberOf } from "@/lib/brandLogoStore";
import { isRateLimited } from "@/lib/rateLimit";
import { renderCardPng } from "@/lib/cards/renderCard";
import { brandPalette, designById } from "@/lib/cards/designs";
import { occasionById } from "@/lib/cards/occasions";
import { contactLine, nameFor, sniffImage, DEFAULT_ACCENT, DEFAULT_PRIMARY, type BrandKit } from "@/lib/brandKit";
import { LANGUAGES } from "@/lib/i18n/dictionaries";

export const runtime = "nodejs";

// Logos change rarely; keep a few in memory so a page of thumbnails does not fetch the same logo twelve times.
const logoCache = new Map<string, { bytes: Buffer; mime: string } | null>();
async function logoFor(url: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !base || !url.startsWith(`${base}/storage/`)) return undefined;
  if (logoCache.has(url)) return logoCache.get(url) ?? undefined;
  let found: { bytes: Buffer; mime: string } | null = null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const bytes = Buffer.from(await res.arrayBuffer());
      const kind = sniffImage(bytes);
      if (kind) found = { bytes, mime: kind.mime };
    }
  } catch { /* no logo on the preview */ }
  if (logoCache.size > 30) logoCache.clear();
  logoCache.set(url, found);
  return found ?? undefined;
}

/**
 * A preview of one library design with the shop's own name, logo and colours on it, so the shopkeeper sees
 * exactly what their customers will get. Nothing is stored and nothing is charged.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const workspaceId = q.get("workspaceId") ?? "";
  if (!(await memberOf(workspaceId))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const design = designById(q.get("design") ?? "");
  if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const lang = LANGUAGES.find((l) => l.code === q.get("lang"))?.code ?? "en";
  const size = Math.min(1080, Math.max(240, Number(q.get("size")) || 480));
  const line = (q.get("line") ?? "").trim().slice(0, 120) || undefined;

  if (await isRateLimited(`libpreview:${workspaceId}`, 1500, 3600)) return NextResponse.json({ error: "Too many previews" }, { status: 429 });

  const admin = createAdminClient();
  const { data: kitRow } = await admin.from("brand_kits").select("*").eq("workspace_id", workspaceId).maybeSingle();
  const kit = kitRow as BrandKit | null;
  const primary = kit?.primary_color || DEFAULT_PRIMARY;
  const accent = kit?.accent_color || DEFAULT_ACCENT;

  const png = renderCardPng({
    lang,
    headline: occasionById(design.occasion)!.label[lang],
    line,
    // Before the shop has filled in its brand kit the design still previews, with a stand-in name.
    businessName: kit?.name?.trim() ? nameFor(kit, lang) : "Your shop name",
    tagline: kit?.tagline || undefined,
    contact: kit ? contactLine(kit) || undefined : undefined,
    primaryColor: primary,
    accentColor: accent,
    logo: await logoFor(kit?.logo_url ?? null),
    size,
    design: { motif: design.motif, variant: design.variant, palette: q.get("mode") === "brand" ? brandPalette(primary, accent) : design.palette },
  });
  return new NextResponse(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=120" } });
}

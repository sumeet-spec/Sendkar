import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { memberOf } from "@/lib/brandLogoStore";
import { renderPosterPng } from "@/lib/cards/renderCard";
import { JOIN_COPY } from "@/lib/joinCopy";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { nameFor, sniffImage, DEFAULT_ACCENT, DEFAULT_PRIMARY, type BrandKit } from "@/lib/brandKit";

export const runtime = "nodejs";

/** The printable counter poster in the chosen language. The QR opens that language's join page. */
export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get("workspaceId") ?? "";
  const lang = LANGUAGES.find((l) => l.code === req.nextUrl.searchParams.get("lang"))?.code ?? "en";
  if (!(await memberOf(workspaceId))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const admin = createAdminClient();
  const [{ data: workspace }, { data: kitRow }] = await Promise.all([
    admin.from("workspaces").select("name, join_code").eq("id", workspaceId).maybeSingle(),
    admin.from("brand_kits").select("*").eq("workspace_id", workspaceId).maybeSingle(),
  ]);
  if (!workspace?.join_code) return NextResponse.json({ error: "Create your join link first." }, { status: 409 });
  const kit = kitRow as BrandKit | null;

  const base = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host")}`;
  const url = `${base}/join/${workspace.join_code}?lang=${lang}`;
  const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const modules = Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => Boolean(qr.modules.get(r, c))));

  let logo: { bytes: Buffer; mime: string } | undefined;
  const logoUrl = kit?.logo_url;
  if (logoUrl && logoUrl.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/`)) {
    const res = await fetch(logoUrl, { signal: AbortSignal.timeout(8000) }).catch(() => null);
    if (res?.ok) {
      const bytes = Buffer.from(await res.arrayBuffer());
      const kind = sniffImage(bytes);
      if (kind) logo = { bytes, mime: kind.mime };
    }
  }

  const png = renderPosterPng({
    lang,
    scanText: JOIN_COPY[lang].scan,
    businessName: kit ? nameFor(kit, lang) : workspace.name,
    qr: modules,
    primaryColor: kit?.primary_color ?? DEFAULT_PRIMARY,
    accentColor: kit?.accent_color ?? DEFAULT_ACCENT,
    logo,
  });
  return new NextResponse(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Content-Disposition": `attachment; filename="counter-poster-${lang}.png"`, "Cache-Control": "no-store" } });
}

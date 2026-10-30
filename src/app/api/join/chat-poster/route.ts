import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { memberOf } from "@/lib/brandLogoStore";
import { renderPosterPng } from "@/lib/cards/renderCard";
import { chatUrl } from "@/lib/chatLink";
import { CHAT_POSTER_COPY } from "@/lib/i18n/chatPosterCopy";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { nameFor, sniffImage, DEFAULT_ACCENT, DEFAULT_PRIMARY, type BrandKit } from "@/lib/brandKit";

export const runtime = "nodejs";

/** A counter poster whose QR opens a WhatsApp chat with the shop, greeting ready, so the assistant answers at once. */
export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get("workspaceId") ?? "";
  const lang = LANGUAGES.find((l) => l.code === req.nextUrl.searchParams.get("lang"))?.code ?? "en";
  if (!(await memberOf(workspaceId))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const admin = createAdminClient();
  const [{ data: workspace }, { data: kitRow }] = await Promise.all([
    admin.from("workspaces").select("name, whatsapp_display_number").eq("id", workspaceId).maybeSingle(),
    admin.from("brand_kits").select("*").eq("workspace_id", workspaceId).maybeSingle(),
  ]);
  const url = workspace?.whatsapp_display_number ? chatUrl(workspace.whatsapp_display_number, lang) : null;
  if (!url) return NextResponse.json({ error: "Connect your WhatsApp number first." }, { status: 409 });
  const kit = kitRow as BrandKit | null;

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
    scanText: CHAT_POSTER_COPY[lang].scan,
    businessName: kit ? nameFor(kit, lang) : workspace?.name ?? "",
    qr: modules,
    primaryColor: kit?.primary_color ?? DEFAULT_PRIMARY,
    accentColor: kit?.accent_color ?? DEFAULT_ACCENT,
    logo,
  });
  return new NextResponse(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Content-Disposition": `attachment; filename="chat-poster-${lang}.png"`, "Cache-Control": "no-store" } });
}

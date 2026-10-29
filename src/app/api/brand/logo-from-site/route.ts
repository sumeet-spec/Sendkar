import { NextRequest, NextResponse } from "next/server";
import { assertPublicHttpsUrl } from "@/lib/ssrf";
import { findLogoCandidates, findThemeColor } from "@/lib/brandLogo";
import { sniffImage } from "@/lib/brandKit";
import { MAX_LOGO_BYTES, memberOf, storeLogo } from "@/lib/brandLogoStore";
import { isRateLimited } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Fetches a public https page or picture, checking every redirect hop, with a size cap. */
async function safeFetch(url: string, maxBytes: number): Promise<{ bytes: Uint8Array; finalUrl: string } | null> {
  let current = url;
  for (let hop = 0; hop < 4; hop++) {
    await assertPublicHttpsUrl(current);
    const res = await fetch(current, { redirect: "manual", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Mozilla/5.0 (compatible; SendkarBot/1.0)" } });
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location");
      if (!next) return null;
      current = new URL(next, current).toString();
      continue;
    }
    if (!res.ok || !res.body) return null;
    const chunks: Uint8Array[] = [];
    let total = 0;
    for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
      total += chunk.length;
      if (total > maxBytes) return null;
      chunks.push(chunk);
    }
    return { bytes: Buffer.concat(chunks), finalUrl: current };
  }
  return null;
}

/** Finds the logo on the shop's own website and saves it to the brand kit. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { workspaceId?: string; website?: string };
  const workspaceId = body.workspaceId ?? "";
  if (!(await memberOf(workspaceId))) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  if (await isRateLimited(`logosite:${workspaceId}`, 10, 3600)) return NextResponse.json({ error: "Too many tries. Try again in a little while." }, { status: 429 });

  let site = (body.website ?? "").trim();
  if (!site) return NextResponse.json({ error: "Type your website address first." }, { status: 400 });
  if (!/^https?:\/\//i.test(site)) site = `https://${site}`;
  site = site.replace(/^http:\/\//i, "https://");

  try {
    const page = await safeFetch(site, 1_500_000);
    if (!page) return NextResponse.json({ error: "Could not open that website." }, { status: 422 });
    const html = new TextDecoder().decode(page.bytes);

    for (const candidate of findLogoCandidates(html, page.finalUrl)) {
      const img = await safeFetch(candidate, MAX_LOGO_BYTES).catch(() => null);
      if (!img || !sniffImage(img.bytes)) continue; // an .ico or an oversized picture: try the next one
      const url = await storeLogo(workspaceId, img.bytes);
      if (url) return NextResponse.json({ url, themeColor: findThemeColor(html) });
    }
    return NextResponse.json({ error: "Could not find a logo on that website. Upload it or make a simple one instead." }, { status: 422 });
  } catch {
    return NextResponse.json({ error: "Could not open that website." }, { status: 422 });
  }
}

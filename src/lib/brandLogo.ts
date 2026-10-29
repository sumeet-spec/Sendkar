const SKIP_WORDS = new Set(["and", "the", "of", "&", "ltd", "pvt", "llp", "co", "company", "private", "limited"]);

/** First letter (whole letter cluster, so Indic scripts stay intact) of the first two real words. */
export function initialsFor(name: string): string {
  const seg = new Intl.Segmenter("und", { granularity: "grapheme" });
  const words = name.split(/\s+/).map((w) => w.replace(/^[^\p{L}\p{N}]+/u, "")).filter((w) => w && !SKIP_WORDS.has(w.toLowerCase().replace(/\.$/, "")));
  const letters = words.slice(0, 2).map((w) => [...seg.segment(w)][0]?.segment ?? "");
  return letters.join("").toUpperCase() || "?";
}

const attr = (tag: string, name: string) =>
  new RegExp(String.raw`\b${name}\s*=\s*("([^"]*)"|'([^']*)')`, "i").exec(tag)?.slice(2).find(Boolean);

/**
 * Picture addresses on a web page that are probably the business's logo, best first:
 * an <img> that says "logo", then the touch icon, then the tab icon. Share pictures (og:image) are skipped: they are banners, not logos.
 * SVG is skipped (cards are drawn from PNG/JPG/WebP).
 */
export function findLogoCandidates(html: string, pageUrl: string): string[] {
  const out: Array<{ url: string; rank: number }> = [];
  const add = (raw: string | undefined, rank: number) => {
    if (!raw || raw.startsWith("data:")) return;
    try {
      const u = new URL(raw, pageUrl);
      if (u.protocol === "https:" && !/\.svg(\?|$)/i.test(u.pathname)) out.push({ url: u.toString(), rank });
    } catch { /* ignore a bad address */ }
  };

  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (/logo/i.test(`${attr(tag, "src") ?? ""} ${attr(tag, "alt") ?? ""} ${attr(tag, "class") ?? ""} ${attr(tag, "id") ?? ""}`)) add(attr(tag, "src"), 0);
  }
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase();
    if (rel.includes("apple-touch-icon")) add(attr(tag, "href"), 1);
    else if (rel.split(/\s+/).includes("icon")) add(attr(tag, "href"), 3);
  }
  const seen = new Set<string>();
  return out.sort((a, b) => a.rank - b.rank).map((c) => c.url).filter((u) => (seen.has(u) ? false : (seen.add(u), true))).slice(0, 6);
}

/** The page's own brand colour, if it declares one. */
export function findThemeColor(html: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (/theme-color/i.test(attr(tag, "name") ?? "")) {
      const c = attr(tag, "content")?.trim();
      if (c && /^#[0-9a-fA-F]{6}$/.test(c)) return c;
    }
  }
  return null;
}

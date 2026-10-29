import fs from "fs";
import path from "path";
import * as hb from "harfbuzzjs";
import { Resvg } from "@resvg/resvg-js";
import type { LanguageCode } from "@/lib/i18n/dictionaries";
import { renderMotif, type MotifId, type Palette, type Variant } from "./motifs";

/**
 * Card renderer. Text is shaped with HarfBuzz and drawn as outlines, because the
 * SVG rasteriser alone breaks Indic conjuncts. Every word on a card is drawn by
 * this code, never by an image model, so the shop's name and the offer are always
 * spelled correctly in the right script.
 */

const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");

const SCRIPT_FONT: Record<LanguageCode, string> = {
  en: "NotoSans", hi: "NotoSansDevanagari", mr: "NotoSansDevanagari", gu: "NotoSansGujarati",
  ta: "NotoSansTamil", te: "NotoSansTelugu", kn: "NotoSansKannada",
} as Record<LanguageCode, string>;

type Loaded = { font: hb.Font; upem: number };
const fonts = new Map<string, Loaded>();

function loadFont(family: string, bold: boolean): Loaded {
  const file = `${family}-${bold ? "Bold" : "Regular"}.ttf`;
  let f = fonts.get(file);
  if (!f) {
    const face = new hb.Face(new hb.Blob(fs.readFileSync(path.join(FONT_DIR, file))));
    f = { font: new hb.Font(face), upem: face.upem };
    fonts.set(file, f);
  }
  return f;
}

type Run = { d: string; x: number; y: number };
type Shaped = { runs: Run[]; width: number; upem: number };

function shape(text: string, family: string, bold: boolean): Shaped {
  const { font, upem } = loadFont(family, bold);
  const buffer = new hb.Buffer();
  buffer.addText(text);
  buffer.guessSegmentProperties();
  hb.shape(font, buffer);
  const infos = buffer.getGlyphInfos();
  const pos = buffer.getGlyphPositions();
  const runs: Run[] = [];
  let pen = 0;
  infos.forEach((g, i) => {
    const d = font.glyphToPath(g.codepoint);
    if (d) runs.push({ d, x: pen + pos[i].xOffset, y: pos[i].yOffset });
    pen += pos[i].xAdvance;
  });
  return { runs, width: pen, upem };
}

/** Width in px of `text` at `size`. Uses the script font, with Latin digits and
 *  English words falling back to Noto Sans when the script font lacks them. */
function measure(text: string, family: string, bold: boolean, size: number) {
  const s = shape(text, family, bold);
  return (s.width * size) / s.upem;
}

/** Greedy word wrap on shaped widths. */
function wrap(text: string, family: string, bold: boolean, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measure(next, family, bold, size) > maxWidth) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawLine(text: string, family: string, bold: boolean, size: number, cx: number, baseline: number, fill: string) {
  const s = shape(text, family, bold);
  const k = size / s.upem;
  const x0 = cx - (s.width * k) / 2;
  const paths = s.runs.map((r) => `<path transform="translate(${r.x} ${r.y})" d="${r.d}"/>`).join("");
  return `<g fill="${fill}" transform="translate(${x0.toFixed(1)} ${baseline.toFixed(1)}) scale(${k} ${-k})">${paths}</g>`;
}

/** Shrinks the type until the text fits in `maxLines` lines, then draws it. */
function block(text: string, lang: LanguageCode, o: { bold: boolean; size: number; minSize: number; maxWidth: number; maxLines: number; cx: number; top: number; fill: string; lineGap?: number }) {
  const family = SCRIPT_FONT[lang] ?? "NotoSans";
  let size = o.size;
  let lines = wrap(text, family, o.bold, size, o.maxWidth);
  // One long word cannot be wrapped, so also shrink when any line is still wider than the card allows.
  const tooWide = (ls: string[], sz: number) => ls.some((l) => measure(l, family, o.bold, sz) > o.maxWidth);
  while ((lines.length > o.maxLines || tooWide(lines, size)) && size > o.minSize) {
    size -= 4;
    lines = wrap(text, family, o.bold, size, o.maxWidth);
  }
  lines = lines.slice(0, o.maxLines);
  const lh = size * (o.lineGap ?? 1.3);
  const svg = lines.map((l, i) => drawLine(l, family, o.bold, size, o.cx, o.top + size + i * lh, o.fill)).join("");
  return { svg, height: lines.length * lh };
}

export type CardInput = {
  lang: LanguageCode;
  /** Large greeting or headline, e.g. "Happy Diwali". */
  headline: string;
  /** Optional second line: the offer or message. */
  line?: string;
  businessName: string;
  tagline?: string;
  /** "Call 98xxxxxx · address" style contact line. */
  contact?: string;
  primaryColor: string;
  accentColor: string;
  /** Raw logo bytes (png/jpg/webp), drawn top-centre. */
  logo?: { bytes: Buffer; mime: string };
  /** Optional AI-made background picture, drawn under a colour wash. */
  background?: { bytes: Buffer; mime: string };
  size?: number;
  /** A library design: its artwork and colours replace the plain brand-colour background. */
  design?: { motif: MotifId; variant: Variant; palette: Palette };
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const safeColor = (c: string, fallback: string) => (HEX.test(c) ? c : fallback);

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const dataUri = (f: { bytes: Buffer; mime: string }) => `data:${f.mime};base64,${f.bytes.toString("base64")}`;

export function buildCardSvg(input: CardInput): string {
  const S = input.size ?? 1080;
  const u = S / 1080;
  const primary = safeColor(input.primaryColor, "#0f766e");
  const design = input.design;
  const accent = safeColor(design?.palette.accent ?? input.accentColor, "#f59e0b");
  // Design cards always put white words on a dark calm panel, so they read over any artwork.
  const onPrimary = design ? "#ffffff" : luminance(primary) > 0.45 ? "#14110f" : "#ffffff";
  const lang = input.lang;
  const margin = 90 * u;
  const maxW = S - margin * 2;

  let y = 70 * u;
  const parts: string[] = [];

  parts.push(`<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${primary}" stop-opacity="0.82"/></linearGradient></defs>`);
  if (design) {
    const p = design.palette;
    parts.push(`<defs><linearGradient id="d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${safeColor(p.bg1, "#222222")}"/><stop offset="1" stop-color="${safeColor(p.bg2, "#111111")}"/></linearGradient><linearGradient id="foot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${safeColor(p.bg2, "#111111")}" stop-opacity="0"/><stop offset="1" stop-color="${safeColor(p.bg2, "#111111")}" stop-opacity="0.9"/></linearGradient></defs>`);
    parts.push(`<rect width="${S}" height="${S}" fill="url(#d)"/>`);
    parts.push(`<g transform="scale(${u})">${renderMotif(design.motif, p, design.variant)}</g>`);
  } else {
    parts.push(`<rect width="${S}" height="${S}" fill="url(#g)"/>`);
  }
  if (input.background && !design) {
    parts.push(`<image href="${dataUri(input.background)}" x="0" y="0" width="${S}" height="${S}" preserveAspectRatio="xMidYMid slice"/>`);
    parts.push(`<rect width="${S}" height="${S}" fill="${primary}" fill-opacity="0.55"/>`);
  }
  // accent frame
  parts.push(`<rect x="${28 * u}" y="${28 * u}" width="${S - 56 * u}" height="${S - 56 * u}" rx="${24 * u}" fill="none" stroke="${accent}" stroke-width="${6 * u}"/>`);

  if (input.logo) {
    const box = 170 * u;
    parts.push(`<rect x="${S / 2 - box / 2}" y="${y}" width="${box}" height="${box}" rx="${28 * u}" fill="#ffffff"/>`);
    parts.push(`<image href="${dataUri(input.logo)}" x="${S / 2 - box / 2 + 14 * u}" y="${y + 14 * u}" width="${box - 28 * u}" height="${box - 28 * u}" preserveAspectRatio="xMidYMid meet"/>`);
    y += box + 40 * u;
  } else {
    y += 40 * u;
  }

  const panelIdx = parts.length;
  const panelTop = y - 30 * u;
  const head = block(input.headline, lang, { bold: true, size: 120 * u, minSize: 56 * u, maxWidth: maxW, maxLines: 3, cx: S / 2, top: y, fill: onPrimary });
  parts.push(head.svg);
  y += head.height + 24 * u;

  if (input.line) {
    parts.push(`<rect x="${S / 2 - 60 * u}" y="${y}" width="${120 * u}" height="${6 * u}" rx="${3 * u}" fill="${accent}"/>`);
    y += 36 * u;
    const sub = block(input.line, lang, { bold: false, size: 60 * u, minSize: 36 * u, maxWidth: maxW, maxLines: 3, cx: S / 2, top: y, fill: onPrimary });
    parts.push(sub.svg);
    y += sub.height;
  }
  if (design) {
    const dark = safeColor(design.palette.bg2, "#111111");
    parts.splice(panelIdx, 0, `<rect x="${margin * 0.45}" y="${panelTop}" width="${S - margin * 0.9}" height="${y - panelTop + 34 * u}" rx="${34 * u}" fill="${dark}" fill-opacity="0.72"/>`);
    parts.push(`<rect x="0" y="${S - 330 * u}" width="${S}" height="${330 * u}" fill="url(#foot)"/>`);
  }

  // footer: business name, tagline, contact — anchored to the bottom
  const foot: string[] = [];
  let fy = S - 70 * u;
  if (input.contact) {
    const c = block(input.contact, lang, { bold: false, size: 38 * u, minSize: 26 * u, maxWidth: maxW, maxLines: 1, cx: S / 2, top: fy - 38 * u * 1.3, fill: onPrimary });
    foot.push(c.svg);
    fy -= 38 * u * 1.3 + 10 * u;
  }
  if (input.tagline) {
    const t = block(input.tagline, lang, { bold: false, size: 40 * u, minSize: 28 * u, maxWidth: maxW, maxLines: 1, cx: S / 2, top: fy - 40 * u * 1.3, fill: onPrimary });
    foot.push(t.svg);
    fy -= 40 * u * 1.3 + 10 * u;
  }
  const n = block(input.businessName, lang, { bold: true, size: 64 * u, minSize: 36 * u, maxWidth: maxW, maxLines: 1, cx: S / 2, top: fy - 64 * u * 1.3, fill: accent });
  foot.push(n.svg);
  parts.push(...foot);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${parts.join("")}</svg>`;
}

export function renderCardPng(input: CardInput): Buffer {
  const svg = buildCardSvg(input);
  return Buffer.from(new Resvg(svg, { fitTo: { mode: "width", value: input.size ?? 1080 } }).render().asPng());
}

// ── Simple logo ("monogram") ────────────────────────────────────────────────
// For shops with no logo: the first letters of the name on a coloured shape, drawn with the same
// shaped-text code as the cards, so it works in every script.

export type MonogramShape = "circle" | "rounded" | "square";

const SCRIPT_RANGES: Array<[RegExp, string]> = [
  [/[ऀ-ॿ]/, "NotoSansDevanagari"], [/[઀-૿]/, "NotoSansGujarati"], [/[஀-௿]/, "NotoSansTamil"],
  [/[ఀ-౿]/, "NotoSansTelugu"], [/[ಀ-೿]/, "NotoSansKannada"],
];

export function fontFamilyForText(text: string): string {
  return SCRIPT_RANGES.find(([re]) => re.test(text))?.[1] ?? "NotoSans";
}

export function renderMonogramPng(input: { text: string; shape: MonogramShape; fill: string; ink: string; size?: number }): Buffer {
  const S = input.size ?? 512;
  const fill = safeColor(input.fill, "#0f766e");
  const ink = safeColor(input.ink, "#ffffff");
  const family = fontFamilyForText(input.text);
  let size = S * 0.46;
  while (measure(input.text, family, true, size) > S * 0.72 && size > 40) size -= 4;
  const shape =
    input.shape === "circle" ? `<circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}" fill="${fill}"/>`
    : `<rect width="${S}" height="${S}" rx="${input.shape === "rounded" ? S * 0.22 : 0}" fill="${fill}"/>`;
  const text = drawLine(input.text, family, true, size, S / 2, S / 2 + size * 0.34, ink);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${shape}${text}</svg>`;
  return Buffer.from(new Resvg(svg, { fitTo: { mode: "width", value: S } }).render().asPng());
}

// ── Counter poster (QR) ─────────────────────────────────────────────────────

export type PosterInput = {
  lang: LanguageCode;
  /** "Scan to get offers on WhatsApp", in the poster's language. */
  scanText: string;
  businessName: string;
  /** QR code as rows of dark/light modules. */
  qr: boolean[][];
  primaryColor: string;
  accentColor: string;
  logo?: { bytes: Buffer; mime: string };
};

/** A printable portrait poster for the shop counter: big words, the logo and a QR code that opens the join page. */
export function renderPosterPng(input: PosterInput): Buffer {
  const W = 1080;
  const primary = safeColor(input.primaryColor, "#0f766e");
  const accent = safeColor(input.accentColor, "#f59e0b");
  const onPrimary = luminance(primary) > 0.45 ? "#14110f" : "#ffffff";
  const parts: string[] = [];

  let y = 80;
  if (input.logo) {
    parts.push(`<rect x="${W / 2 - 80}" y="${y}" width="160" height="160" rx="26" fill="#ffffff"/>`);
    parts.push(`<image href="${dataUri(input.logo)}" x="${W / 2 - 66}" y="${y + 14}" width="132" height="132" preserveAspectRatio="xMidYMid meet"/>`);
    y += 200;
  }
  const title = block(input.scanText, input.lang, { bold: true, size: 84, minSize: 48, maxWidth: W - 180, maxLines: 3, cx: W / 2, top: y, fill: onPrimary });
  parts.push(title.svg);
  y += title.height + 30;

  // QR on a white panel, with the quiet border scanners need.
  const n = input.qr.length;
  const panel = 640, pad = 40;
  const cell = (panel - pad * 2) / n;
  const px = (W - panel) / 2;
  parts.push(`<rect x="${px}" y="${y}" width="${panel}" height="${panel}" rx="28" fill="#ffffff"/>`);
  const mods: string[] = [];
  input.qr.forEach((row, r) => row.forEach((dark, c) => {
    if (dark) mods.push(`<rect x="${(px + pad + c * cell).toFixed(2)}" y="${(y + pad + r * cell).toFixed(2)}" width="${(cell + 0.6).toFixed(2)}" height="${(cell + 0.6).toFixed(2)}"/>`);
  }));
  parts.push(`<g fill="#000000">${mods.join("")}</g>`);
  y += panel + 50;

  const name = block(input.businessName, input.lang, { bold: true, size: 72, minSize: 36, maxWidth: W - 180, maxLines: 2, cx: W / 2, top: y, fill: accent });
  parts.push(name.svg);

  // The sheet is as tall as its content, so there is no empty space at the bottom.
  const H = Math.round(y + name.height + 90);
  const frame = `<rect width="${W}" height="${H}" fill="${primary}"/><rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="28" fill="none" stroke="${accent}" stroke-width="6"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${frame}${parts.join("")}</svg>`;
  return Buffer.from(new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng());
}

// ── Printed flyer (for the expo stand) ──────────────────────────────────────

export type FlyerInput = {
  lang: LanguageCode;
  headline: string;
  bullets: string[];
  cta: string;
  url: string;
  qr: boolean[][];
};

/** A portrait flyer: the promise, three reasons, and a QR code that opens the site. Drawn like the cards, so every script is correct. */
export function renderFlyerPng(input: FlyerInput): Buffer {
  const W = 1080;
  const bg = "#052e16", accent = "#22c55e", gold = "#fcd34d";
  const parts: string[] = [];
  let y = 70;

  const brand = block("Sendkar", "en", { bold: true, size: 68, minSize: 40, maxWidth: W - 200, maxLines: 1, cx: W / 2, top: y, fill: accent });
  parts.push(brand.svg);
  y += brand.height + 30;

  const head = block(input.headline, input.lang, { bold: true, size: 84, minSize: 48, maxWidth: W - 160, maxLines: 4, cx: W / 2, top: y, fill: "#ffffff" });
  parts.push(head.svg);
  y += head.height + 40;

  input.bullets.forEach((text, i) => {
    const row = block(text, input.lang, { bold: false, size: 46, minSize: 30, maxWidth: W - 300, maxLines: 2, cx: W / 2 + 40, top: y + 22, fill: "#ffffff" });
    const h = Math.max(row.height + 44, 120);
    parts.push(`<rect x="60" y="${y}" width="${W - 120}" height="${h}" rx="28" fill="#ffffff" fill-opacity="0.08"/>`);
    parts.push(`<circle cx="130" cy="${y + h / 2}" r="34" fill="${accent}"/>`);
    parts.push(`<path d="M${113} ${y + h / 2} l13 14 l25 -30" fill="none" stroke="#052e16" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`);
    parts.push(row.svg.replace(`translate(`, `translate(`));
    y += h + 20;
  });
  y += 20;

  const cta = block(input.cta, input.lang, { bold: true, size: 66, minSize: 40, maxWidth: W - 160, maxLines: 2, cx: W / 2, top: y, fill: gold });
  parts.push(cta.svg);
  y += cta.height + 24;

  const n = input.qr.length, panel = 430, pad = 34, cell = (panel - pad * 2) / n, px = (W - panel) / 2;
  parts.push(`<rect x="${px}" y="${y}" width="${panel}" height="${panel}" rx="26" fill="#ffffff"/>`);
  const mods: string[] = [];
  input.qr.forEach((row, r) => row.forEach((dark, c) => {
    if (dark) mods.push(`<rect x="${(px + pad + c * cell).toFixed(2)}" y="${(y + pad + r * cell).toFixed(2)}" width="${(cell + 0.6).toFixed(2)}" height="${(cell + 0.6).toFixed(2)}"/>`);
  }));
  parts.push(`<g fill="#000000">${mods.join("")}</g>`);
  y += panel + 30;

  const link = block(input.url, "en", { bold: true, size: 44, minSize: 28, maxWidth: W - 160, maxLines: 1, cx: W / 2, top: y, fill: "#ffffff" });
  parts.push(link.svg);

  const H = Math.round(y + link.height + 70);
  const frame = `<rect width="${W}" height="${H}" fill="${bg}"/><rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="30" fill="none" stroke="${accent}" stroke-width="6"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${frame}${parts.join("")}</svg>`;
  return Buffer.from(new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng());
}

import fs from "fs";
import path from "path";
import * as hb from "harfbuzzjs";
import { Resvg } from "@resvg/resvg-js";
import type { LanguageCode } from "@/lib/i18n/dictionaries";

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
  const accent = safeColor(input.accentColor, "#f59e0b");
  const onPrimary = luminance(primary) > 0.45 ? "#14110f" : "#ffffff";
  const lang = input.lang;
  const margin = 90 * u;
  const maxW = S - margin * 2;

  let y = 70 * u;
  const parts: string[] = [];

  parts.push(`<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${primary}" stop-opacity="0.82"/></linearGradient></defs>`);
  parts.push(`<rect width="${S}" height="${S}" fill="url(#g)"/>`);
  if (input.background) {
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

  const head = block(input.headline, lang, { bold: true, size: 120 * u, minSize: 56 * u, maxWidth: maxW, maxLines: 3, cx: S / 2, top: y, fill: onPrimary });
  parts.push(head.svg);
  y += head.height + 24 * u;

  if (input.line) {
    parts.push(`<rect x="${S / 2 - 60 * u}" y="${y}" width="${120 * u}" height="${6 * u}" rx="${3 * u}" fill="${accent}"/>`);
    y += 36 * u;
    const sub = block(input.line, lang, { bold: false, size: 60 * u, minSize: 36 * u, maxWidth: maxW, maxLines: 3, cx: S / 2, top: y, fill: onPrimary });
    parts.push(sub.svg);
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

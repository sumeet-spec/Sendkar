import { Resvg } from "@resvg/resvg-js";
import type { LanguageCode } from "@/lib/i18n/dictionaries";
import { BILL_LABELS } from "@/lib/i18n/billCopy";
import { fontFamilyForText, textKit } from "@/lib/cards/renderCard";

/**
 * The bill picture a customer receives on WhatsApp. Drawn by our own text renderer (not a font in the
 * SVG), so Gujarati, Hindi, Tamil and the rest are shaped correctly. Amounts and dates are always in
 * Latin digits, which every customer can read and which match the shop's own books.
 */

export type BillItem = { name: string; qty?: number; rate?: number };

export type BillInput = {
  lang: LanguageCode;
  shopName: string;
  /** Phone or address line under the shop name. */
  shopLine?: string;
  gstin?: string;
  billNo: string;
  /** Already formatted, e.g. "29 Oct 2026". */
  dateText: string;
  customerName?: string;
  customerPhone?: string;
  items: BillItem[];
  amount: number;
  paid: boolean;
  /** Already formatted; only shown on an unpaid bill. */
  dueText?: string;
  note?: string;
  primaryColor: string;
  logo?: { bytes: Buffer; mime: string };
};

const W = 900;
const PAD = 56;
const HEX = /^#[0-9a-fA-F]{6}$/;

function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 150;
}

/** Indian grouping: 1,23,456.50. Whole rupees drop the paise. */
export function formatRupees(n: number): string {
  const fixed = Math.abs(n).toFixed(2);
  const [whole, paise] = fixed.split(".");
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}` : last3;
  return `₹${grouped}${paise === "00" ? "" : "." + paise}`;
}

export function renderBillPng(input: BillInput): Buffer {
  const L = BILL_LABELS[input.lang] ?? BILL_LABELS.en;
  const script = fontFamilyForText(L.bill);
  const primary = HEX.test(input.primaryColor) ? input.primaryColor : "#0f766e";
  const onPrimary = isDark(primary) ? "#ffffff" : "#14110f";
  const ink = "#1c1917", muted = "#6b6560", rule = "#e7e2dc";
  const parts: string[] = [];
  const t = textKit;
  const right = W - PAD;

  // Header band: logo, shop name, contact line.
  let y = 0;
  const shopFam = fontFamilyForText(input.shopName);
  let nameSize = 54;
  const textLeft = input.logo ? PAD + 112 : PAD;
  while (t.measure(input.shopName, shopFam, true, nameSize) > right - textLeft && nameSize > 30) nameSize -= 2;
  const bandH = 64 + nameSize + (input.shopLine || input.gstin ? 44 : 0) + 40;
  parts.push(`<rect width="${W}" height="${bandH}" fill="${primary}"/>`);
  if (input.logo) {
    parts.push(`<rect x="${PAD}" y="${(bandH - 96) / 2}" width="96" height="96" rx="18" fill="#ffffff"/>`);
    parts.push(`<image href="data:${input.logo.mime};base64,${input.logo.bytes.toString("base64")}" x="${PAD + 8}" y="${(bandH - 96) / 2 + 8}" width="80" height="80" preserveAspectRatio="xMidYMid meet"/>`);
  }
  let by = 40 + nameSize;
  parts.push(t.line(input.shopName, shopFam, true, nameSize, textLeft, by, onPrimary));
  const sub = [input.shopLine, input.gstin ? `${L.gstin}: ${input.gstin}` : ""].filter(Boolean).join("   ·   ");
  if (sub) {
    by += 46;
    parts.push(t.line(sub, fontFamilyForText(sub), false, 26, textLeft, by, onPrimary));
  }
  y = bandH + 56;

  // Title and number/date.
  parts.push(t.line(L.bill, script, true, 40, PAD, y, ink));
  parts.push(t.line(`${L.no}  ${input.billNo}`, script, true, 28, right, y - 14, ink, "end"));
  y += 38;
  parts.push(t.line(`${L.date}  ${input.dateText}`, script, false, 26, right, y - 16, muted, "end"));
  y += 14;

  const who = [input.customerName, input.customerPhone].filter(Boolean).join("   ");
  if (who) {
    parts.push(t.line(`${L.billedTo}:  ${who}`, fontFamilyForText(who) === "NotoSans" ? script : fontFamilyForText(who), false, 28, PAD, y + 34, ink));
    y += 60;
  }
  y += 20;
  parts.push(`<rect x="${PAD}" y="${y}" width="${W - PAD * 2}" height="3" fill="${rule}"/>`);
  y += 12;

  // Items.
  const items = input.items.slice(0, 14);
  const showQty = items.some((i) => i.qty && i.qty !== 1);
  const showRate = items.some((i) => i.rate);
  if (items.length) {
    const cAmt = right, cRate = right - 170, cQty = right - (showRate ? 330 : 170);
    y += 38;
    parts.push(t.line(L.item, script, true, 24, PAD, y, muted));
    if (showQty) parts.push(t.line(L.qty, script, true, 24, cQty, y, muted, "end"));
    if (showRate) parts.push(t.line(L.rate, script, true, 24, cRate, y, muted, "end"));
    parts.push(t.line(L.amount, script, true, 24, cAmt, y, muted, "end"));
    y += 18;
    for (const it of items) {
      const fam = fontFamilyForText(it.name);
      const nameMax = (showQty ? cQty - 90 : showRate ? cRate - 120 : cAmt - 140) - PAD;
      const lines = t.wrap(it.name, fam, false, 30, nameMax).slice(0, 2);
      const lineTotal = it.rate ? it.rate * (it.qty ?? 1) : undefined;
      y += 46;
      lines.forEach((ln, i) => parts.push(t.line(ln, fam, false, 30, PAD, y + i * 38, ink)));
      if (showQty && it.qty) parts.push(t.line(String(it.qty), "NotoSans", false, 30, cQty, y, ink, "end"));
      if (showRate && it.rate) parts.push(t.line(formatRupees(it.rate), "NotoSans", false, 30, cRate, y, ink, "end"));
      if (lineTotal !== undefined) parts.push(t.line(formatRupees(lineTotal), "NotoSans", false, 30, cAmt, y, ink, "end"));
      y += (lines.length - 1) * 38 + 14;
    }
    y += 6;
    parts.push(`<rect x="${PAD}" y="${y}" width="${W - PAD * 2}" height="3" fill="${rule}"/>`);
  }

  // Total.
  y += 84;
  parts.push(t.line(L.total, script, true, 40, PAD, y, ink));
  parts.push(t.line(formatRupees(input.amount), "NotoSans", true, 60, right, y + 6, ink, "end"));
  y += 40;

  // Paid / due stamp.
  const stampColor = input.paid ? "#15803d" : "#b91c1c";
  const stampText = input.paid ? L.paid : L.due;
  const stampFont = fontFamilyForText(stampText);
  let stampSize = 38;
  while (t.measure(stampText, stampFont, true, stampSize) > W - PAD * 2 - 80 && stampSize > 24) stampSize -= 2;
  const sw = t.measure(stampText, stampFont, true, stampSize) + 72;
  y += 14;
  parts.push(`<rect x="${PAD}" y="${y}" width="${sw}" height="${stampSize + 36}" rx="12" fill="none" stroke="${stampColor}" stroke-width="5"/>`);
  parts.push(t.line(stampText, stampFont, true, stampSize, PAD + 36, y + stampSize + 10, stampColor));
  y += stampSize + 36;
  if (!input.paid && input.dueText) {
    y += 44;
    parts.push(t.line(`${L.dueBy}:  ${input.dueText}`, script, false, 28, PAD, y, ink));
  }

  if (input.note) {
    const fam = fontFamilyForText(input.note);
    for (const ln of t.wrap(input.note, fam, false, 26, W - PAD * 2).slice(0, 2)) {
      y += 42;
      parts.push(t.line(ln, fam, false, 26, PAD, y, muted));
    }
  }

  // Footer.
  y += 80;
  parts.push(`<rect x="${PAD}" y="${y - 40}" width="${W - PAD * 2}" height="3" fill="${rule}"/>`);
  parts.push(t.line(L.thanks, script, true, 30, W / 2, y + 10, primary, "middle"));
  const H = y + 70;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#ffffff"/>${parts.join("")}</svg>`;
  return Buffer.from(new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng());
}


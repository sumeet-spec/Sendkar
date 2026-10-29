import type { LanguageCode } from "@/lib/i18n/dictionaries";
import { LANGUAGES } from "@/lib/i18n/dictionaries";

export type BrandKit = {
  workspace_id: string;
  name: string;
  names: Partial<Record<LanguageCode, string>>;
  tagline: string;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  phone: string;
  address: string;
  website: string;
};

export const DEFAULT_PRIMARY = "#0f766e";
export const DEFAULT_ACCENT = "#f59e0b";

const HEX = /^#[0-9a-fA-F]{6}$/;
export const isHexColor = (v: string) => HEX.test(v);

/** The shop's name as it should read on a card in `lang`; falls back to the main name. */
export function nameFor(kit: Pick<BrandKit, "name" | "names">, lang: LanguageCode): string {
  return kit.names?.[lang]?.trim() || kit.name.trim();
}

/** Keeps only known language codes with non-empty, trimmed, length-capped names. */
export function cleanNames(input: Record<string, unknown>): Partial<Record<LanguageCode, string>> {
  const out: Partial<Record<LanguageCode, string>> = {};
  for (const { code } of LANGUAGES) {
    const v = input[code];
    if (typeof v === "string" && v.trim()) out[code] = v.trim().slice(0, 60);
  }
  return out;
}

/** Sniffs the real image type from the first bytes; the browser-supplied type is not trusted. */
export function sniffImage(bytes: Uint8Array): { mime: "image/png" | "image/jpeg" | "image/webp"; ext: string } | null {
  if (bytes.length > 12 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { mime: "image/png", ext: "png" };
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (bytes.length > 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

/** "Call 98765 43210 · Station Road" style single line for the bottom of a card. */
export function contactLine(kit: Pick<BrandKit, "phone" | "address" | "website">): string {
  return [kit.phone, kit.address, kit.website].map((s) => s.trim()).filter(Boolean).join("  ·  ");
}

import fs from "fs";
import path from "path";
import { brandPalette, type Design } from "./designs";

const ART_DIR = path.join(process.cwd(), "src", "assets", "art");
const cache = new Map<string, { bytes: Buffer; mime: string }>();

function loadArt(file: string): { bytes: Buffer; mime: string } | undefined {
  // Only plain file names from our own manifest are ever read.
  if (!/^[a-z0-9-]+\.jpg$/.test(file)) return undefined;
  const hit = cache.get(file);
  if (hit) return hit;
  try {
    const found = { bytes: fs.readFileSync(path.join(ART_DIR, file)), mime: "image/jpeg" };
    if (cache.size > 40) cache.clear();
    cache.set(file, found);
    return found;
  } catch {
    return undefined;
  }
}

/**
 * Everything the card renderer needs to draw one library design: its picture (read from disk, kept in memory),
 * and its colours, either its own or repainted in the shop's brand colours (the picture then gets a wash of the
 * shop's main colour).
 */
export function designInput(design: Design, mode: "festival" | "brand", brand: { primary: string; accent: string }) {
  const art = design.art ? loadArt(design.art) : undefined;
  const brandMode = mode === "brand";
  return {
    motif: design.motif,
    variant: design.variant,
    palette: brandMode ? brandPalette(brand.primary, brand.accent) : design.palette,
    art,
    tint: brandMode && art ? brand.primary : undefined,
  };
}

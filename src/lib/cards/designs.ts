import type { OccasionId } from "./occasions";
import type { MotifId, Palette, Variant } from "./motifs";
import { ART } from "./artManifest";

/**
 * The festival library: ready-made designs a shop picks, adds its own logo and words to, and sends.
 * Every design is drawn from plain vector shapes (see motifs.ts), so the library is free to use and costs
 * nothing per image. Designs are shown from 45 days before their festival (see festivals.ts).
 */
export type Design = {
  id: string;
  occasion: OccasionId;
  name: string;
  /** Vector artwork, used only for a festival that has no pictures yet. */
  motif?: MotifId;
  variant?: Variant;
  palette: Palette;
  /** A background picture in src/assets/art, with its average colour. */
  art?: string;
  avg?: string;
};

const P = (bg1: string, bg2: string, accent: string, art1: string, art2: string): Palette => ({ bg1, bg2, accent, art1, art2 });

// Palettes. Each is deep enough for white words on the panel, with bright artwork colours.
const PURPLE_GOLD = P("#3b0f5c", "#1a0630", "#ffc24a", "#ff8a3d", "#ffd166");
const MAROON_GOLD = P("#7a1226", "#3a0610", "#ffc857", "#f4a259", "#ffe08a");
const ORANGE_MAROON = P("#d9480f", "#7a1f0a", "#ffd43b", "#ffa94d", "#fff3bf");
const NAVY_GOLD = P("#0b1d4a", "#050d26", "#ffd166", "#f4b942", "#ffffff");
const TEAL_GOLD = P("#0f5257", "#062d30", "#ffd166", "#2ec4b6", "#ffe8a3");
const GREEN_GOLD = P("#0e4d2f", "#052a18", "#ffd166", "#52b788", "#ffe08a");
const EMERALD_SILVER = P("#0d3b33", "#04201b", "#e9eef2", "#34d399", "#cbd5e1");
const PINK_PURPLE = P("#a4166a", "#4a0a40", "#ffd1ec", "#ff6fb5", "#ffc2e2");
const MAGENTA_ORANGE = P("#9d0b6a", "#3f0436", "#ffb703", "#ff7b00", "#ffd166");
const RED_GREEN = P("#a4161a", "#4a0a0c", "#ffd166", "#2d9d5b", "#fff3d6");
const NIGHT_BLUE = P("#12306b", "#08142e", "#ffffff", "#7cc4ff", "#cfe8ff");
const SKY_ORANGE = P("#0b6ec4", "#073a73", "#ffd43b", "#ff7a3d", "#ffffff");
const SAFFRON = P("#c2410c", "#6b200a", "#fff1c9", "#ffb347", "#ffe29a");
const LEAF_GREEN = P("#1b5e20", "#0b2f10", "#ffd43b", "#8bc34a", "#fff3b0");
const HOLI_DARK = P("#1b1035", "#0a0618", "#ffd43b", "#ff3d9a", "#2bd4ff");
const HOLI_BRIGHT = P("#7e22ce", "#3b0a6b", "#fde047", "#f43f5e", "#22d3ee");
const ROSE_GOLD = P("#7c2d4f", "#3a1226", "#ffd8a8", "#f4a6b7", "#ffe3d3");
const TRI = P("#14305a", "#09162e", "#ffffff", "#ff9933", "#138808");
const RED_YELLOW = P("#b3101d", "#5a070e", "#ffd60a", "#ffd60a", "#ffffff");
const SUN_ORANGE = P("#b8460a", "#5c2205", "#ffe08a", "#ffb703", "#ffd9a0");
const INDIGO_GOLD = P("#2b1b6b", "#120a35", "#ffd166", "#9b8cff", "#ffe6a8");

type Def = [name: string, motif: MotifId, variant: Variant, palette: Palette];

const CATALOG: Partial<Record<OccasionId, Def[]>> = {
  diwali: [["Golden diyas", "diyas", 0, PURPLE_GOLD], ["Rangoli glow", "mandala", 1, MAROON_GOLD], ["Marigold festival", "marigold", 0, ORANGE_MAROON]],
  dhanteras: [["Golden coins", "gold", 0, GREEN_GOLD], ["Lamps of wealth", "diyas", 1, MAROON_GOLD], ["Royal mandala", "mandala", 2, INDIGO_GOLD]],
  bhaidooj: [["Marigold blessing", "marigold", 1, ROSE_GOLD], ["Pink rangoli", "mandala", 0, PINK_PURPLE], ["Festive lamps", "diyas", 0, ORANGE_MAROON]],
  newyear: [["Night fireworks", "burst", 0, NAVY_GOLD], ["Bright confetti", "confetti", 0, TEAL_GOLD], ["Golden sparkle", "gold", 1, INDIGO_GOLD]],
  holi: [["Colour splash", "splash", 0, HOLI_DARK], ["Rainbow burst", "splash", 1, HOLI_BRIGHT], ["Playful confetti", "confetti", 1, HOLI_BRIGHT]],
  eid: [["Crescent and lanterns", "crescent", 0, EMERALD_SILVER], ["Midnight crescent", "crescent", 1, NIGHT_BLUE], ["Teal mandala", "mandala", 1, TEAL_GOLD]],
  navratri: [["Garba nights", "dandiya", 0, MAGENTA_ORANGE], ["Nine-night mandala", "mandala", 0, PINK_PURPLE], ["Marigold garlands", "marigold", 0, MAGENTA_ORANGE]],
  ganesh: [["Lotus blessing", "lotus", 0, ORANGE_MAROON], ["Hibiscus and marigold", "marigold", 0, MAROON_GOLD], ["Sacred mandala", "mandala", 2, SAFFRON]],
  rakhi: [["Rakhi threads", "rakhi", 0, MAGENTA_ORANGE], ["Marigold and thread", "rakhi", 1, ROSE_GOLD], ["Lotus bond", "lotus", 1, PINK_PURPLE]],
  pongal: [["Overflowing pot", "pot", 0, SUN_ORANGE], ["Harvest sun", "pot", 1, GREEN_GOLD], ["Mango toran", "toran", 0, LEAF_GREEN]],
  sankranti: [["Sky of kites", "kites", 0, SKY_ORANGE], ["Kites at dusk", "kites", 1, SUN_ORANGE], ["Festive confetti", "confetti", 0, INDIGO_GOLD]],
  uttarayan: [["Kite flying", "kites", 0, SKY_ORANGE], ["Sunset kites", "kites", 1, MAGENTA_ORANGE], ["Kites and mandala", "kites", 2, NAVY_GOLD]],
  puthandu: [["Mango toran", "toran", 0, LEAF_GREEN], ["Harvest pot", "pot", 1, SUN_ORANGE], ["Kolam mandala", "mandala", 0, MAROON_GOLD]],
  ugadi: [["Mango leaves", "toran", 0, LEAF_GREEN], ["Marigold toran", "toran", 1, SAFFRON], ["Spring marigold", "marigold", 1, GREEN_GOLD]],
  rajyotsava: [["Red and yellow", "confetti", 0, RED_YELLOW], ["Celebration burst", "burst", 0, RED_YELLOW], ["Golden mandala", "mandala", 0, RED_YELLOW]],
  chhath: [["Rising sun", "sun", 0, SUN_ORANGE], ["Sun by the river", "sun", 1, SAFFRON], ["Marigold offering", "marigold", 0, ORANGE_MAROON]],
  akshaya: [["Gold for good luck", "gold", 0, MAROON_GOLD], ["Golden glow", "gold", 1, GREEN_GOLD], ["Lotus and gold", "lotus", 0, INDIGO_GOLD]],
  ramnavami: [["Saffron marigold", "marigold", 0, SAFFRON], ["Divine burst", "burst", 1, SUN_ORANGE], ["Temple mandala", "mandala", 0, ORANGE_MAROON]],
  republic: [["Tricolour bands", "flag", 0, TRI], ["Tricolour waves", "flag", 1, TRI], ["Chakra", "flag", 2, TRI]],
  independence: [["Tricolour bands", "flag", 0, TRI], ["Tricolour waves", "flag", 1, TRI], ["Freedom fireworks", "burst", 0, TRI]],
  christmas: [["Christmas trees", "tree", 0, RED_GREEN], ["Midnight trees", "tree", 1, NIGHT_BLUE], ["Festive sparkle", "burst", 1, RED_GREEN]],
  sale: [["Big sale", "confetti", 0, MAGENTA_ORANGE], ["Offer burst", "burst", 0, INDIGO_GOLD], ["Golden offer", "gold", 0, MAROON_GOLD]],
  thanks: [["Thank you lotus", "lotus", 2, PINK_PURPLE], ["Warm marigold", "marigold", 1, ROSE_GOLD], ["Soft mandala", "mandala", 1, TEAL_GOLD]],
};

const VECTOR_DESIGNS: Design[] = (Object.entries(CATALOG) as Array<[OccasionId, Def[]]>).flatMap(([occasion, defs]) =>
  defs.map(([name, motif, variant, palette], i) => ({ id: `${occasion}-v${i + 1}`, occasion, name, motif, variant, palette })),
);

/** The panel and footer take a dark version of the picture's own colour, and the shop name a warm gold. */
function artPalette(avg: string): Palette {
  return { bg1: mix(avg, "#000000", 0.5), bg2: mix(avg, "#000000", 0.8), accent: "#fcd34d", art1: mix(avg, "#ffffff", 0.4), art2: mix(avg, "#ffffff", 0.7) };
}

const ART_DESIGNS: Design[] = ART.map((a, i) => ({ id: a.id, occasion: a.occasion, name: "", art: a.file, avg: a.avg, palette: artPalette(a.avg) }));
const OCCASIONS_WITH_ART = new Set(ART_DESIGNS.map((d) => d.occasion));

/** Pictures where a festival has them, the older vector artwork only where it does not. */
export const DESIGNS: Design[] = [...ART_DESIGNS, ...VECTOR_DESIGNS.filter((d) => !OCCASIONS_WITH_ART.has(d.occasion))];

export const designById = (id: string): Design | undefined => DESIGNS.find((d) => d.id === id);
export const designsFor = (occasion: OccasionId): Design[] => DESIGNS.filter((d) => d.occasion === occasion);

// ── The shop's own colours ─────────────────────────────────────────────────

const HEX = /^#[0-9a-fA-F]{6}$/;
const rgb = (hex: string): [number, number, number] => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const toHex = (c: number[]) => `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
const mix = (a: string, b: string, t: number) => { const x = rgb(a), y = rgb(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };

/** The same artwork in the shop's own colours: dark backdrop from the main colour, art in the highlight and light tints. */
export function brandPalette(primary: string, accent: string): Palette {
  const p = HEX.test(primary) ? primary : "#0f766e";
  const a = HEX.test(accent) ? accent : "#f59e0b";
  return { bg1: mix(p, "#000000", 0.35), bg2: mix(p, "#000000", 0.72), accent: a, art1: mix(p, "#ffffff", 0.45), art2: mix(a, "#ffffff", 0.35) };
}

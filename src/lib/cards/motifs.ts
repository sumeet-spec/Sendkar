/**
 * Festival artwork for the library, drawn as plain vector shapes (no AI, no licences, no cost per image).
 * Every motif paints the whole 1080 x 1080 card as background art; the renderer then lays a calm panel
 * behind the words so they stay readable whatever the art. Colours come from a palette so one motif can
 * be shown in the festival's own colours or in the shop's brand colours.
 */

export type Palette = { bg1: string; bg2: string; accent: string; art1: string; art2: string };
export type MotifId =
  | "mandala" | "diyas" | "marigold" | "crescent" | "splash" | "kites" | "pot" | "dandiya" | "lotus"
  | "tree" | "burst" | "rakhi" | "flag" | "toran" | "gold" | "confetti" | "sun";
export type Variant = 0 | 1 | 2;

const f = (n: number) => Number(n.toFixed(1));

/** Small deterministic random numbers, so a design always looks the same. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const petals = (cx: number, cy: number, n: number, inner: number, len: number, wid: number, fill: string, op: number, rot = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = rot + (360 / n) * i;
    return `<ellipse cx="${f(cx)}" cy="${f(cy - inner - len / 2)}" rx="${f(wid / 2)}" ry="${f(len / 2)}" fill="${fill}" fill-opacity="${op}" transform="rotate(${f(a)} ${f(cx)} ${f(cy)})"/>`;
  }).join("");

const circle = (cx: number, cy: number, r: number, fill: string, op = 1) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${fill}" fill-opacity="${op}"/>`;
const ring = (cx: number, cy: number, r: number, w: number, stroke: string, op = 1) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-opacity="${op}"/>`;
const star = (cx: number, cy: number, r: number, fill: string, op = 1, points = 4) => {
  const pts = Array.from({ length: points * 2 }, (_, i) => {
    const rr = i % 2 === 0 ? r : r * 0.3;
    const a = (Math.PI / points) * i - Math.PI / 2;
    return `${f(cx + rr * Math.cos(a))},${f(cy + rr * Math.sin(a))}`;
  }).join(" ");
  return `<polygon points="${pts}" fill="${fill}" fill-opacity="${op}"/>`;
};
const flower = (cx: number, cy: number, r: number, c1: string, c2: string) =>
  petals(cx, cy, 10, r * 0.25, r * 0.75, r * 0.5, c1, 1) + petals(cx, cy, 10, r * 0.15, r * 0.5, r * 0.36, c2, 1, 18) + circle(cx, cy, r * 0.16, c1);
const diya = (cx: number, cy: number, s: number, bowl: string, flame: string) =>
  circle(cx, cy - s * 0.9, s * 0.95, flame, 0.18) +
  `<path d="M${f(cx - s)} ${f(cy)} Q${f(cx)} ${f(cy + s * 1.15)} ${f(cx + s)} ${f(cy)} Z" fill="${bowl}"/>` +
  `<path d="M${f(cx)} ${f(cy - s * 1.45)} Q${f(cx + s * 0.42)} ${f(cy - s * 0.6)} ${f(cx)} ${f(cy - s * 0.1)} Q${f(cx - s * 0.42)} ${f(cy - s * 0.6)} ${f(cx)} ${f(cy - s * 1.45)} Z" fill="${flame}"/>`;

function mandalaAt(cx: number, cy: number, R: number, p: Palette, op: number) {
  return (
    petals(cx, cy, 16, R * 0.62, R * 0.38, R * 0.17, p.art1, op * 0.9) +
    petals(cx, cy, 12, R * 0.34, R * 0.3, R * 0.2, p.art2, op, 15) +
    petals(cx, cy, 8, R * 0.1, R * 0.22, R * 0.15, p.art1, op * 1.1) +
    ring(cx, cy, R * 1.02, 3, p.art2, op) + ring(cx, cy, R * 0.6, 2, p.art1, op * 0.9)
  );
}

const MOTIFS: Record<MotifId, (p: Palette, v: Variant) => string> = {
  mandala: (p, v) => {
    if (v === 2) return mandalaAt(0, 0, 420, p, 0.5) + mandalaAt(1080, 1080, 420, p, 0.5) + star(900, 160, 26, p.accent, 0.8, 8) + star(170, 920, 22, p.accent, 0.8, 8);
    return mandalaAt(540, v === 1 ? 760 : 520, 520, p, 0.38) + Array.from({ length: 16 }, (_, i) => circle(540 + 470 * Math.cos((i / 16) * 6.283), (v === 1 ? 760 : 520) + 470 * Math.sin((i / 16) * 6.283), 7, p.accent, 0.8)).join("");
  },
  diyas: (p, v) => {
    const bulbs = Array.from({ length: 11 }, (_, i) => {
      const x = 60 + i * 96;
      const y = 70 + Math.sin(i * 0.9) * 26;
      return circle(x, y, 22, p.accent, 0.22) + circle(x, y, 11, p.accent);
    }).join("");
    const string = `<path d="M0 60 ${Array.from({ length: 11 }, (_, i) => `Q${60 + i * 96 - 48} 112 ${60 + i * 96} ${70 + Math.sin(i * 0.9) * 26}`).join(" ")}" fill="none" stroke="${p.art2}" stroke-width="3" stroke-opacity="0.6"/>`;
    const row = [150, 330, 540, 750, 930].map((x, i) => diya(x, v === 1 ? 770 : 740, i === 2 ? 96 : i % 2 ? 62 : 74, p.art1, p.accent)).join("");
    return mandalaAt(540, 540, 560, p, 0.2) + string + bulbs + row + star(870, 230, 20, p.accent, 0.9, 8) + star(210, 250, 14, p.accent, 0.9, 8);
  },
  marigold: (p, v) => {
    const strand = (y0: number, flip: number) => Array.from({ length: 9 }, (_, i) => flower(70 + i * 117, y0 + Math.sin(i * 0.8 + flip) * 28, 50, i % 2 ? p.art1 : p.art2, p.accent)).join("");
    return `<path d="M0 90 Q540 190 1080 90" fill="none" stroke="${p.art2}" stroke-width="4" stroke-opacity="0.5"/>` + strand(96, 0) + (v === 1 ? strand(980, 2) : flower(120, 980, 70, p.art1, p.accent) + flower(960, 980, 70, p.art2, p.accent)) +
      flower(40, 360 + v * 60, 56, p.art1, p.accent) + flower(1040, 700 - v * 60, 56, p.art2, p.accent) + mandalaAt(540, 560, 420, p, 0.16);
  },
  crescent: (p, v) => {
    const cx = v === 1 ? 700 : 380, cy = 600, r = 190;
    const moon = `<path d="M${cx} ${cy - r} A${r} ${r} 0 1 0 ${cx} ${cy + r} A${r * 1.3} ${r * 1.3} 0 0 1 ${cx} ${cy - r} Z" fill="${p.art1}"/>`;
    const lantern = (x: number, len: number, c: string) => `<line x1="${x}" y1="0" x2="${x}" y2="${len}" stroke="${p.art2}" stroke-width="3" stroke-opacity="0.7"/><rect x="${x - 26}" y="${len}" width="52" height="78" rx="14" fill="${c}"/><rect x="${x - 14}" y="${len + 14}" width="28" height="50" rx="8" fill="${p.accent}" fill-opacity="0.85"/>`;
    return mandalaAt(540, 640, 480, p, 0.14) + moon + star(cx + 140, cy + 110, 26, p.art2, 0.95, 5) + star(cx - 230, cy - 60, 15, p.art1, 0.9, 5) + star(cx + 60, cy - 250, 16, p.art2, 0.9, 5) +
      (v === 1 ? lantern(110, 330, p.art1) + lantern(230, 430, p.art2) : lantern(900, 330, p.art1) + lantern(980, 450, p.art2));
  },
  splash: (p, v) => {
    const r = rng(7 + v * 13);
    const colours = [p.art1, p.art2, p.accent, "#ffffff"];
    return Array.from({ length: 46 }, () => {
      const a = r() * 6.283, d = 380 + r() * 420;
      const x = 540 + Math.cos(a) * d * 1.05, y = 540 + Math.sin(a) * d;
      return circle(x, y, 18 + r() * 90, colours[Math.floor(r() * colours.length)], 0.55 + r() * 0.4);
    }).join("") + Array.from({ length: 40 }, () => circle(r() * 1080, r() * 1080, 3 + r() * 6, colours[Math.floor(r() * 3)], 0.7)).join("");
  },
  kites: (p, v) => {
    const kite = (x: number, y: number, s: number, rot: number, c1: string, c2: string) =>
      `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 ${-s} L${s * 0.62} 0 L0 ${s * 1.1} L${-s * 0.62} 0 Z" fill="${c1}"/><path d="M0 ${-s} L${s * 0.62} 0 L0 0 Z M0 ${s * 1.1} L${-s * 0.62} 0 L0 0 Z" fill="${c2}" fill-opacity="0.9"/>` +
      `<path d="M0 ${s * 1.1} q${s * 0.35} ${s * 0.4} 0 ${s * 0.8} q${-s * 0.35} ${s * 0.4} 0 ${s * 0.8}" fill="none" stroke="${c1}" stroke-width="5"/></g>`;
    const set: Array<[number, number, number, number, string, string]> = v === 1
      ? [[170, 240, 110, -20, p.art1, p.art2], [900, 180, 90, 18, p.art2, p.accent], [980, 520, 80, -12, p.accent, p.art1], [110, 640, 76, 14, p.art2, p.art1], [930, 880, 70, 20, p.art1, p.art2]]
      : [[200, 190, 100, -18, p.art1, p.art2], [880, 250, 120, 16, p.art2, p.accent], [90, 520, 70, 12, p.accent, p.art1], [1000, 600, 76, -15, p.art1, p.art2], [160, 900, 84, -10, p.art2, p.art1], [900, 920, 90, 14, p.accent, p.art2]];
    const strings = set.map(([x, y]) => `<path d="M${x} ${y + 90} Q${(x + 540) / 2} ${y + 400} 540 1180" fill="none" stroke="${p.art2}" stroke-opacity="0.4" stroke-width="2"/>`).join("");
    return strings + set.map((k) => kite(...k)).join("") + (v === 2 ? mandalaAt(540, 560, 430, p, 0.14) : "") + star(520, 110, 14, p.accent, 0.8, 8);
  },
  pot: (p, v) => {
    const pot = (x: number, y: number, s: number) =>
      `<path d="M${x - s} ${y} Q${x - s * 1.25} ${y + s * 1.3} ${x} ${y + s * 1.45} Q${x + s * 1.25} ${y + s * 1.3} ${x + s} ${y} Z" fill="${p.art1}"/><rect x="${x - s * 0.9}" y="${y - s * 0.16}" width="${s * 1.8}" height="${s * 0.3}" rx="${s * 0.12}" fill="${p.art2}"/>` +
      `<path d="M${x - s * 0.7} ${y - s * 0.2} q${s * 0.15} ${-s * 0.6} ${s * 0.45} ${-s * 0.35} q${s * 0.25} ${-s * 0.7} ${s * 0.55} ${-s * 0.1} q${s * 0.5} ${-s * 0.1} ${s * 0.3} ${s * 0.45} Z" fill="#fff" fill-opacity="0.85"/>`;
    const cane = (x: number) => `<line x1="${x}" y1="1080" x2="${x + 30}" y2="620" stroke="${p.art2}" stroke-width="18" stroke-linecap="round"/><path d="M${x + 30} 620 q40 -80 -10 -150 q70 40 10 150 z" fill="${p.accent}"/>`;
    const dots = Array.from({ length: 12 }, (_, i) => Array.from({ length: 4 }, (_, j) => circle(90 + i * 82, 1000 + j * 0 + (i % 2 ? 22 : 0), 6, "#fff", 0.55))).flat().join("");
    return mandalaAt(540, 440, 470, p, 0.12) + circle(v === 1 ? 160 : 920, 180, 110, p.accent, 0.95) + ring(v === 1 ? 160 : 920, 180, 150, 5, p.accent, 0.5) + pot(v === 1 ? 800 : 270, 780, 120) + cane(v === 1 ? 960 : 100) + cane(v === 1 ? 1010 : 150) + dots;
  },
  dandiya: (p, v) => {
    const stick = (x: number, y: number, rot: number, c: string) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-14" y="-190" width="28" height="380" rx="14" fill="${c}"/>${[-120, -60, 0, 60, 120].map((yy) => `<rect x="-14" y="${yy}" width="28" height="14" fill="${p.accent}"/>`).join("")}</g>`;
    const garba = (cx: number, cy: number, R: number) => Array.from({ length: 18 }, (_, i) => circle(cx + R * Math.cos((i / 18) * 6.283), cy + R * Math.sin((i / 18) * 6.283), 11, i % 2 ? p.art1 : p.accent, 0.9)).join("") + ring(cx, cy, R * 0.82, 3, p.art2, 0.6);
    return mandalaAt(540, 540, 500, p, 0.15) + garba(540, 540, v === 1 ? 480 : 440) + stick(130, 210, 35, p.art1) + stick(210, 190, -35, p.art2) + stick(950, 880, 35, p.art2) + stick(870, 900, -35, p.art1) + star(920, 190, 22, p.accent, 0.9, 8) + star(160, 870, 22, p.accent, 0.9, 8);
  },
  lotus: (p, v) => {
    const lot = (cx: number, cy: number, s: number, op: number) =>
      petals(cx, cy, 7, s * 0.05, s, s * 0.34, p.art2, op, -90 + 0).replace(/rotate\((-?[\d.]+)/g, (m, a) => `rotate(${Number(a) - 90 + 90}`) +
      petals(cx, cy, 5, s * 0.02, s * 0.7, s * 0.3, p.art1, op, -72) + circle(cx, cy, s * 0.1, p.accent, op);
    const base = (cx: number, cy: number, s: number) => lot(cx, cy, s, 0.95);
    return mandalaAt(540, v === 1 ? 200 : 540, 460, p, 0.14) + base(540, 800, 250) + (v === 2 ? base(130, 160, 130) + base(950, 160, 130) : base(120, 140, 110) + base(960, 160, 90)) +
      Array.from({ length: 14 }, (_, i) => circle(40 + i * 76, 1020 - (i % 3) * 8, 5, "#fff", 0.5)).join("");
  },
  tree: (p, v) => {
    const tree = (x: number, y: number, s: number) =>
      [0, 1, 2].map((i) => `<polygon points="${x},${y - s * (1.3 - i * 0.42)} ${x - s * (0.5 + i * 0.28)},${y - s * (0.3 - i * 0.42) * 0.0 - i * s * 0.05 + s * (i * 0.0)} ${x + s * (0.5 + i * 0.28)},${y}" fill="${i % 2 ? p.art1 : p.art2}"/>`).join("").replace(/points="([^"]+)"/g, "points=\"$1\"") +
      `<rect x="${x - s * 0.08}" y="${y}" width="${s * 0.16}" height="${s * 0.2}" fill="${p.accent}"/>` + star(x, y - s * 1.3, s * 0.12, p.accent, 1, 5) +
      [[-0.25, -0.2], [0.22, -0.5], [-0.12, -0.8], [0.3, -0.05]].map(([dx, dy], i) => circle(x + dx * s, y + dy * s, s * 0.06, i % 2 ? "#ffffff" : p.accent)).join("");
    const r = rng(11 + v);
    const snow = Array.from({ length: 60 }, () => circle(r() * 1080, r() * 1080, 3 + r() * 6, "#fff", 0.55)).join("");
    const bulbs = Array.from({ length: 12 }, (_, i) => circle(50 + i * 88, 50 + Math.sin(i) * 20, 12, i % 2 ? p.accent : p.art1)).join("");
    return snow + bulbs + (v === 1 ? tree(150, 980, 330) + tree(940, 960, 250) : tree(200, 990, 360) + tree(900, 990, 220) + tree(1010, 1000, 160));
  },
  burst: (p, v) => {
    const fw = (cx: number, cy: number, R: number, c: string, n = 18) =>
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * 6.283, x1 = cx + Math.cos(a) * R * 0.35, y1 = cy + Math.sin(a) * R * 0.35, x2 = cx + Math.cos(a) * R, y2 = cy + Math.sin(a) * R;
        return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="6" stroke-linecap="round"/>` + circle(cx + Math.cos(a) * R * 1.14, cy + Math.sin(a) * R * 1.14, 7, c);
      }).join("") + circle(cx, cy, R * 0.12, c);
    const set: Array<[number, number, number, string]> = v === 1 ? [[200, 210, 150, p.art1], [880, 260, 120, p.art2], [540, 960, 130, p.accent]] : [[210, 200, 140, p.art1], [870, 180, 110, p.accent], [920, 800, 130, p.art2], [160, 830, 100, p.art2]];
    const r = rng(3 + v);
    return set.map(([x, y, R, c]) => fw(x, y, R, c)).join("") + Array.from({ length: 50 }, () => star(r() * 1080, r() * 1080, 6 + r() * 12, "#fff", 0.6, 4)).join("");
  },
  rakhi: (p, v) => {
    const thread = (y: number) => `<path d="M0 ${y} Q270 ${y + 140} 540 ${y + 40} Q810 ${y - 60} 1080 ${y + 80}" fill="none" stroke="${p.art2}" stroke-width="10" stroke-opacity="0.8"/><path d="M0 ${y + 24} Q270 ${y + 164} 540 ${y + 64} Q810 ${y - 36} 1080 ${y + 104}" fill="none" stroke="${p.art1}" stroke-width="6" stroke-opacity="0.8"/>`;
    const medal = (cx: number, cy: number, R: number) => circle(cx, cy, R * 1.1, p.accent, 0.25) + petals(cx, cy, 14, R * 0.55, R * 0.45, R * 0.24, p.art1, 1) + circle(cx, cy, R * 0.62, p.art2) + ring(cx, cy, R * 0.5, 4, p.accent) + circle(cx, cy, R * 0.28, p.accent) + circle(cx, cy, R * 0.12, p.art1);
    return mandalaAt(540, 560, 460, p, 0.14) + thread(v === 1 ? 140 : 90) + medal(v === 1 ? 880 : 200, v === 1 ? 250 : 250, 120) + medal(v === 1 ? 190 : 890, 900, 100) + thread(930 - v * 20).replace(/stroke-opacity="0.8"/g, 'stroke-opacity="0.5"');
  },
  flag: (p, v) => {
    const saffron = "#ff9933", green = "#138808", white = "#ffffff", navy = "#000080";
    const chakra = (cx: number, cy: number, R: number, op: number) => ring(cx, cy, R, 8, navy, op) + Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * 6.283; return `<line x1="${f(cx)}" y1="${f(cy)}" x2="${f(cx + Math.cos(a) * R)}" y2="${f(cy + Math.sin(a) * R)}" stroke="${navy}" stroke-opacity="${op}" stroke-width="3"/>`; }).join("") + circle(cx, cy, R * 0.12, navy, op);
    if (v === 1) {
      return `<rect x="0" y="0" width="1080" height="1080" fill="${white}" fill-opacity="0.0"/><path d="M0 0 H1080 V220 Q540 340 0 220 Z" fill="${saffron}"/><path d="M0 1080 H1080 V860 Q540 980 0 860 Z" fill="${green}"/>` + chakra(540, 540, 330, 0.1);
    }
    return `<rect x="0" y="0" width="1080" height="190" fill="${saffron}"/><rect x="0" y="890" width="1080" height="190" fill="${green}"/><rect x="0" y="190" width="1080" height="700" fill="${white}" fill-opacity="0.92"/>` + chakra(540, 540, v === 2 ? 380 : 300, 0.12) + Array.from({ length: 9 }, (_, i) => circle(80 + i * 115, 95, 9, white, 0.9)).join("");
  },
  toran: (p, v) => {
    const leaf = (x: number, y: number, len: number, rot: number, c: string) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 Q${len * 0.22} ${len * 0.5} 0 ${len} Q${-len * 0.22} ${len * 0.5} 0 0 Z" fill="${c}"/><line x1="0" y1="6" x2="0" y2="${len * 0.9}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="3"/></g>`;
    const row = (y: number, big: number) => `<path d="M0 ${y - 10} Q540 ${y + 60} 1080 ${y - 10}" fill="none" stroke="${p.art2}" stroke-width="5"/>` + Array.from({ length: 13 }, (_, i) => {
      const x = 40 + i * 83; const yy = y - 10 + Math.sin((i / 12) * Math.PI) * 52;
      return leaf(x, yy, big + (i % 2) * 24, 0, i % 2 ? p.art1 : p.art2) + circle(x, yy + big + 36 + (i % 2) * 24, 12, p.accent);
    }).join("");
    return row(40, 150) + (v === 1 ? row(1000, 0).replace(/<path d="M0 [^"]+"[^>]*\/>/, "") : flower(110, 960, 64, p.art1, p.accent) + flower(970, 960, 64, p.art2, p.accent)) + mandalaAt(540, 580, 430, p, 0.14);
  },
  gold: (p, v) => {
    const coin = (cx: number, cy: number, R: number) => circle(cx, cy, R, p.accent) + ring(cx, cy, R * 0.78, 4, p.art1, 0.9) + `<text x="${cx}" y="${cy + R * 0.28}" font-size="${R}" text-anchor="middle" fill="${p.art1}" fill-opacity="0.9" font-family="serif" font-weight="700">₹</text>`;
    const r = rng(21 + v);
    const coins = (v === 1
      ? [[150, 210, 80], [920, 160, 62], [1000, 460, 50], [90, 640, 56], [200, 900, 70], [900, 930, 84]]
      : [[920, 200, 84], [150, 160, 60], [80, 520, 50], [1010, 640, 58], [860, 930, 66], [170, 930, 90]]) as Array<[number, number, number]>;
    return mandalaAt(540, 540, 540, p, 0.12) + coins.map(([x, y, R]) => coin(x, y, R)).join("") + Array.from({ length: 40 }, () => star(r() * 1080, r() * 1080, 8 + r() * 16, p.accent, 0.55 + r() * 0.4, 4)).join("");
  },
  confetti: (p, v) => {
    const r = rng(5 + v * 9);
    const cols = [p.art1, p.art2, p.accent, "#ffffff"];
    return Array.from({ length: 90 }, () => {
      const x = r() * 1080, y = r() * 1080, c = cols[Math.floor(r() * cols.length)], s = 10 + r() * 26, k = r();
      return k < 0.4 ? `<rect x="${f(x)}" y="${f(y)}" width="${f(s)}" height="${f(s * 0.45)}" fill="${c}" fill-opacity="0.9" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>` : k < 0.7 ? circle(x, y, s * 0.4, c, 0.9) : star(x, y, s * 0.7, c, 0.9, 5);
    }).join("");
  },
  sun: (p, v) => {
    const cx = v === 1 ? 200 : 540, cy = v === 1 ? 220 : 240;
    const waves = [0, 1, 2, 3].map((i) => `<path d="M0 ${860 + i * 60} q135 -40 270 0 t270 0 t270 0 t270 0 V1080 H0 Z" fill="${i % 2 ? p.art1 : p.art2}" fill-opacity="${0.3 + i * 0.1}"/>`).join("");
    return Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * 6.283; return `<line x1="${f(cx + Math.cos(a) * 170)}" y1="${f(cy + Math.sin(a) * 170)}" x2="${f(cx + Math.cos(a) * 260)}" y2="${f(cy + Math.sin(a) * 260)}" stroke="${p.accent}" stroke-width="8" stroke-linecap="round" stroke-opacity="0.8"/>`; }).join("") +
      circle(cx, cy, 130, p.accent) + circle(cx, cy, 160, p.accent, 0.25) + waves + flower(130, 800, 54, p.art1, p.accent) + flower(960, 780, 54, p.art2, p.accent);
  },
};

export function renderMotif(id: MotifId, p: Palette, v: Variant): string {
  return MOTIFS[id](p, v);
}

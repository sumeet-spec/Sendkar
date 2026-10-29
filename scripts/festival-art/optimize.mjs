// Turns the reviewed Higgsfield pictures into the small files the app ships with, and writes the manifest.
//
//   node scripts/festival-art/optimize.mjs <folder of raw pictures>
//
// Every <occasion>-<n>.png in the folder becomes src/assets/art/<occasion>-<n>.jpg (1080 x 1080, about 100 to 200 KB),
// except those listed one per line in <folder>/rejects.txt. Writes src/lib/cards/artManifest.ts.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = process.argv[2];
if (!dir) { console.error("usage: node optimize.mjs <folder of raw pictures>"); process.exit(1); }

const outDir = path.resolve("src/assets/art");
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) if (f.endsWith(".jpg")) fs.unlinkSync(path.join(outDir, f)); // rebuild from scratch

const rejectsFile = path.join(dir, "rejects.txt");
const rejects = new Set(fs.existsSync(rejectsFile) ? fs.readFileSync(rejectsFile, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : []);

const hex = (n) => n.toString(16).padStart(2, "0");
const entries = [];
let bytes = 0;
for (const f of fs.readdirSync(dir).filter((x) => /^[a-z]+-\d+\.png$/.test(x)).sort((a, b) => a.localeCompare(b, "en", { numeric: true }))) {
  if (rejects.has(f) || rejects.has(f.replace(".png", ""))) continue;
  const id = f.replace(".png", "");
  const occasion = id.replace(/-\d+$/, "");
  const file = `${id}.jpg`;
  const out = await sharp(path.join(dir, f)).resize(1080, 1080, { fit: "cover" }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  fs.writeFileSync(path.join(outDir, file), out);
  bytes += out.length;
  const px = await sharp(out).resize(1, 1).raw().toBuffer();
  entries.push({ id, occasion, file, avg: `#${hex(px[0])}${hex(px[1])}${hex(px[2])}` });
}

const ts = `import type { OccasionId } from "./occasions";

/**
 * The festival background pictures that ship with the app (src/assets/art). Written by
 * scripts/festival-art/optimize.mjs from the pictures that passed review; do not edit by hand.
 * \`avg\` is the picture's average colour, used to tint the text panel so it sits naturally on the art.
 */
export type ArtEntry = { id: string; occasion: OccasionId; file: string; avg: string };

export const ART: ArtEntry[] = [
${entries.map((e) => `  { id: "${e.id}", occasion: "${e.occasion}", file: "${e.file}", avg: "${e.avg}" },`).join("\n")}
];
`;
fs.writeFileSync(path.resolve("src/lib/cards/artManifest.ts"), ts);
const perOccasion = entries.reduce((m, e) => ((m[e.occasion] = (m[e.occasion] ?? 0) + 1), m), {});
console.log(`${entries.length} pictures, ${(bytes / 1048576).toFixed(1)} MB in total`);
console.log(Object.entries(perOccasion).map(([k, v]) => `${k}:${v}`).join(" "));

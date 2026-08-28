import sharp from "sharp";
import { mkdirSync } from "node:fs";

// Matches src/components/Logo.tsx exactly — same accent green box, same
// dispatched-message mark — so the PWA/Android icon is the real Sendkar
// mark, not a placeholder.
const svg = (size, radius) => `
<svg width="${size}" height="${size}" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <rect width="20" height="20" rx="${radius}" fill="#22c55e"/>
  <g fill="#05130a">
    <circle cx="3.2" cy="10" r="1" opacity="0.35"/>
    <circle cx="6.6" cy="10" r="1.3" opacity="0.65"/>
    <path d="M9.5 6.2L17 10L9.5 13.8L9.5 10.9L13.2 10L9.5 9.1Z"/>
  </g>
</svg>`;

mkdirSync("public/icons", { recursive: true });

const sizes = [
  { size: 192, radius: 4.5, file: "icon-192.png" },
  { size: 512, radius: 4.5, file: "icon-512.png" },
  { size: 512, radius: 0, file: "icon-maskable-512.png" }, // maskable: safe-zone padding handled by radius 0 + OS mask
];

for (const { size, radius, file } of sizes) {
  await sharp(Buffer.from(svg(size, radius)))
    .resize(size, size)
    .png()
    .toFile(`public/icons/${file}`);
  console.log("wrote", file);
}

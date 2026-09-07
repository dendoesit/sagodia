/**
 * Renders the home-screen icons from an inline SVG so the repo keeps a single
 * source of truth for the artwork. Run with `npm run icons` after changing it.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "icons");

/** @param {{ inset?: number; rounded?: boolean }} options */
function iconSvg({ inset = 0, rounded = true } = {}) {
  const scale = 1 - inset * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7FD0F5"/>
      <stop offset="100%" stop-color="#CFF3B0"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="url(#sky)"/>
  <circle cx="430" cy="82" r="58" fill="#FFE066"/>
  <path d="M0 400 Q 130 340 256 392 T 512 368 L512 512 L0 512 Z" fill="#6FBF5C"/>
  <g transform="translate(256 272) scale(${(4.6 * scale).toFixed(3)}) translate(-50 -46)">
    <path d="M22 30 L18 6 L42 20 Z" fill="#F79E52" stroke="#2F2A26" stroke-width="2.8" stroke-linejoin="round"/>
    <path d="M78 30 L82 6 L58 20 Z" fill="#F79E52" stroke="#2F2A26" stroke-width="2.8" stroke-linejoin="round"/>
    <path d="M25 25 L23 12 L36 20 Z" fill="#4A3524"/>
    <path d="M75 25 L77 12 L64 20 Z" fill="#4A3524"/>
    <circle cx="50" cy="46" r="28" fill="#FBAF63" stroke="#2F2A26" stroke-width="3"/>
    <path d="M50 46 q-22 2 -20 14 q3 14 20 14 q17 0 20 -14 q2 -12 -20 -14 Z" fill="#FFF3E2"/>
    <g>
      <circle cx="39" cy="42" r="7" fill="#FFFFFF" stroke="#2F2A26" stroke-width="2"/>
      <circle cx="39" cy="42.6" r="3.6" fill="#2F2A26"/>
      <circle cx="40.8" cy="40.4" r="1.4" fill="#FFFFFF"/>
      <circle cx="61" cy="42" r="7" fill="#FFFFFF" stroke="#2F2A26" stroke-width="2"/>
      <circle cx="61" cy="42.6" r="3.6" fill="#2F2A26"/>
      <circle cx="62.8" cy="40.4" r="1.4" fill="#FFFFFF"/>
    </g>
    <g opacity="0.55">
      <ellipse cx="28" cy="54" rx="5.5" ry="3.9" fill="#FF8FA0"/>
      <ellipse cx="72" cy="54" rx="5.5" ry="3.9" fill="#FF8FA0"/>
    </g>
    <path d="M44 58 L56 58 L50 64 Z" fill="#2F2A26" stroke-linejoin="round"/>
    <path d="M42 66 Q 50 73 58 66" fill="none" stroke="#2F2A26" stroke-width="2.6" stroke-linecap="round"/>
  </g>
</svg>`;
}

const targets = [
  { file: "icon-192.png", size: 192, svg: iconSvg() },
  { file: "icon-512.png", size: 512, svg: iconSvg() },
  { file: "apple-touch-icon.png", size: 180, svg: iconSvg({ rounded: false }) },
  { file: "icon-maskable-512.png", size: 512, svg: iconSvg({ inset: 0.12, rounded: false }) },
];

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "icon.svg"), iconSvg(), "utf8");

for (const target of targets) {
  await sharp(Buffer.from(target.svg))
    .resize(target.size, target.size)
    .png()
    .toFile(path.join(OUT_DIR, target.file));
  console.log(`wrote public/icons/${target.file}`);
}

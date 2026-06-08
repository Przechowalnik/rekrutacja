import path from "node:path";

import sharp from "sharp";

const OUT_DIR = "public/icons";
const BRAND = "#2563eb";
const BRAND_LIGHT = "#60a5fa";

// Rounded-square brand tile with a centered white briefcase mark (job board).
// The briefcase sits within the central ~60% so it survives maskable cropping.
const svg = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${BRAND}"/>
          <stop offset="1" stop-color="${BRAND_LIGHT}"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" ry="14" fill="url(#g)"/>
      <path d="M26 25v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3" fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round"/>
      <rect x="16" y="25" width="32" height="23" rx="5" fill="#ffffff"/>
      <rect x="16" y="33.5" width="32" height="5" rx="2.5" fill="url(#g)"/>
      <rect x="29" y="32" width="6" height="7" rx="2" fill="#ffffff"/>
    </svg>`,
  );

const targets = [
  { ext: "webp", name: "pwa-16x16.webp", size: 16 },
  { ext: "webp", name: "pwa-32x32.webp", size: 32 },
  { ext: "webp", name: "pwa-48x48.webp", size: 48 },
  { ext: "webp", name: "pwa-144x144.webp", size: 144 },
  { ext: "webp", name: "pwa-180x180.webp", size: 180 },
  { ext: "png", name: "pwa-512x512.png", size: 512 },
  { ext: "png", name: "apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  // Rasterize from a 512 master for crisp edges, then resize down.
  let pipeline = sharp(svg(512)).resize(t.size, t.size);
  pipeline = t.ext === "png" ? pipeline.png() : pipeline.webp({ quality: 90 });
  const outPath = path.join(OUT_DIR, t.name);
  await pipeline.toFile(outPath);

  // Verify the white briefcase actually rendered (not a solid blue square).
  const stats = await sharp(svg(t.size))
    .png()
    .toBuffer()
    .then((b) => sharp(b).stats());
  const maxChannel = Math.max(...stats.channels.map((c) => c.max));
  console.log(
    `${t.name} (${t.size}px) written — brightest channel ${maxChannel} ${maxChannel > 240 ? "OK (white present)" : "WARN: no white pixels?"}`,
  );
}

// Social share card (Open Graph / Twitter): briefcase mark + wordmark on brand.
const ogSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${BRAND}"/>
        <stop offset="1" stop-color="${BRAND_LIGHT}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <g transform="translate(490,150)">
      <rect x="0" y="0" width="220" height="220" rx="48" fill="#ffffff"/>
      <path d="M84 86v-12a12 12 0 0 1 12-12h28a12 12 0 0 1 12 12v12" fill="none" stroke="${BRAND}" stroke-width="11" stroke-linecap="round"/>
      <rect x="52" y="86" width="116" height="84" rx="18" fill="${BRAND}"/>
      <rect x="52" y="118" width="116" height="18" rx="9" fill="#ffffff"/>
      <rect x="98" y="112" width="24" height="26" rx="7" fill="${BRAND}"/>
    </g>
    <text x="600" y="440" text-anchor="middle" dominant-baseline="central"
      font-family="Arial, Helvetica, 'DejaVu Sans', sans-serif" font-weight="800"
      font-size="118" letter-spacing="-2" fill="#ffffff">do-pracy.pl</text>
    <text x="600" y="530" text-anchor="middle" dominant-baseline="central"
      font-family="Arial, Helvetica, 'DejaVu Sans', sans-serif" font-weight="500"
      font-size="40" fill="#e8f0ff">Znajdź pracę w swojej okolicy</text>
  </svg>`,
);
await sharp(ogSvg).png().toFile("public/og-image.png");
console.log("og-image.png (1200x630) written");

console.log("done");

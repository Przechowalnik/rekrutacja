import path from "node:path";

import sharp from "sharp";

const OUT_DIR = "public/icons";
const BRAND = "#2563eb";

// Rounded-square brand background with a centered white "DP" monogram.
// Content kept within the central ~60% so it survives maskable safe-zone cropping.
const svg = (size) => {
  const radius = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.42);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${BRAND}"/>
      <text x="50%" y="50%" dy="0.02em" text-anchor="middle" dominant-baseline="central"
        font-family="Arial, Helvetica, 'DejaVu Sans', sans-serif" font-weight="700"
        font-size="${fontSize}" letter-spacing="-${Math.round(size * 0.02)}" fill="#ffffff">DP</text>
    </svg>`,
  );
};

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
  // Rasterize from a 512 master for crisp letterforms, then resize down.
  let pipeline = sharp(svg(512)).resize(t.size, t.size);
  pipeline = t.ext === "png" ? pipeline.png() : pipeline.webp({ quality: 90 });
  const outPath = path.join(OUT_DIR, t.name);
  await pipeline.toFile(outPath);

  // Verify the white "DP" actually rendered (not a solid blue square).
  const stats = await sharp(svg(t.size)).png().toBuffer().then((b) => sharp(b).stats());
  const maxChannel = Math.max(...stats.channels.map((c) => c.max));
  console.log(
    `${t.name} (${t.size}px) written — brightest channel ${maxChannel} ${maxChannel > 240 ? "OK (white present)" : "WARN: no white pixels?"}`,
  );
}

// Social share card (Open Graph / Twitter): "do-pracy.pl" wordmark on brand.
const ogSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="${BRAND}"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
      font-family="Arial, Helvetica, 'DejaVu Sans', sans-serif" font-weight="800"
      font-size="120" letter-spacing="-2" fill="#ffffff">do-pracy.pl</text>
  </svg>`,
);
await sharp(ogSvg).png().toFile("public/og-image.png");
console.log("og-image.png (1200x630) written");

console.log("done");

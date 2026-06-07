import fs from "node:fs/promises";
import path from "node:path";

import fg from "fast-glob";
import sharp from "sharp";

type ManifestEntry = {
  avifSrcSet: string;
  fallbackSrc: string;
  fallbackSrcSet?: string;
  webpSrcSet: string;
};

type Manifest = Record<string, ManifestEntry>;

const INPUT_GLOB = ["public/**/**/*.{png,jpg,jpeg,webp}", "!public/img-gen/**"];

const OUT_DIR = "public/img-gen";
const MANIFEST_PATH = "app/generated/image-manifest.json";

const WIDTHS = [320, 480, 640, 768, 1024, 1280, 1600];

const Q_WEBP = 75;
const Q_AVIF = 55;
const Q_FALLBACK = 80;

function publicToWebPath(filePath: string) {
  const normalized = filePath.replaceAll("\\", "/");

  const withoutPublic = normalized.replace(/^\.?\/?public\//, "");

  return "/" + withoutPublic;
}

function changeExtension(p: string, extension: string) {
  return p.replace(/\.[^.]+$/, "." + extension);
}

function addSuffixBeforeExtension(p: string, suffix: string) {
  return p.replace(/\.[^.]+$/, `${suffix}$&`);
}

async function ensureDirection(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function fileExists(p: string) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await ensureDirection(OUT_DIR);
  await ensureDirection(path.dirname(MANIFEST_PATH));

  const files = await fg(INPUT_GLOB, { dot: false });
  const manifest: Manifest = {};

  for (const inputFile of files) {
    const webSource = publicToWebPath(inputFile);

    if (webSource.endsWith(".svg")) {
      continue;
    }

    const extension = path.extname(inputFile).toLowerCase().replace(".", ""); // png/jpg/jpeg/webp

    const relatedFromPublic = inputFile.replace(/^public[/\\]/, "");
    const relatedDirection = path.dirname(relatedFromPublic);
    const baseName = path.basename(relatedFromPublic);

    const outDirection = path.join(OUT_DIR, relatedDirection);
    await ensureDirection(outDirection);

    const avifParts: string[] = [];
    const webpParts: string[] = [];
    const fallbackParts: string[] = [];

    const fallbackExtension = extension === "jpg" ? "jpeg" : extension;

    for (const w of WIDTHS) {
      const suffix = `@${w}w`;

      const outBase = path.join(
        outDirection,
        addSuffixBeforeExtension(baseName, suffix),
      );

      const outWebp = changeExtension(outBase, "webp");
      const outAvif = changeExtension(outBase, "avif");
      const outFallback = changeExtension(outBase, fallbackExtension);

      if (!(await fileExists(outWebp))) {
        const buf = await sharp(inputFile)
          .resize({ width: w, withoutEnlargement: true })
          .webp({ quality: Q_WEBP })
          .toBuffer();
        await fs.writeFile(outWebp, buf);
      }

      if (!(await fileExists(outAvif))) {
        const buf = await sharp(inputFile)
          .resize({ width: w, withoutEnlargement: true })
          .avif({ quality: Q_AVIF })
          .toBuffer();
        await fs.writeFile(outAvif, buf);
      }

      if (!(await fileExists(outFallback))) {
        let pipeline = sharp(inputFile).resize({
          width: w,
          withoutEnlargement: true,
        });

        if (fallbackExtension === "jpeg") {
          pipeline = pipeline.jpeg({ mozjpeg: true, quality: Q_FALLBACK });
        }
        if (fallbackExtension === "png") {
          pipeline = pipeline.png({ compressionLevel: 9 });
        }
        if (fallbackExtension === "webp") {
          pipeline = pipeline.webp({ quality: Q_WEBP });
        }

        const buf = await pipeline.toBuffer();
        await fs.writeFile(outFallback, buf);
      }

      const webpWebPath = publicToWebPath(outWebp);
      const avifWebPath = publicToWebPath(outAvif);
      const fallbackWebPath = publicToWebPath(outFallback);

      webpParts.push(`${webpWebPath} ${w}w`);
      avifParts.push(`${avifWebPath} ${w}w`);
      fallbackParts.push(`${fallbackWebPath} ${w}w`);
    }

    const fallbackW = WIDTHS.includes(1024)
      ? 1024
      : WIDTHS[Math.floor(WIDTHS.length / 2)];
    const fallbackSuffix = `@${fallbackW}w`;
    const fallbackBase = path.join(
      OUT_DIR,
      relatedDirection,
      addSuffixBeforeExtension(baseName, fallbackSuffix),
    );
    const fallbackSource = publicToWebPath(
      changeExtension(fallbackBase, fallbackExtension),
    );

    manifest[webSource] = {
      avifSrcSet: avifParts.join(", "),
      fallbackSrc: fallbackSource,
      fallbackSrcSet: fallbackParts.join(", "),
      webpSrcSet: webpParts.join(", "),
    };
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
  console.warn(`✅ Generated: ${Object.keys(manifest).length} entries`);
  console.warn(`✅ Manifest: ${MANIFEST_PATH}`);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch(error => {
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});

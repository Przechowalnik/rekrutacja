// Vercel Image Optimization helper. Routes external images through
// /_vercel/image which serves AVIF/WebP based on Accept header.
// Domain must be whitelisted in vercel.json `images.remotePatterns`.

const OPTIMIZED_PATH_PREFIX = "/_vercel/image";
const DEFAULT_QUALITY = 75;
const SUPPORTED_HOSTS = ["supabase.co"];

const shouldOptimise = (sourceUrl: string): boolean => {
  if (!sourceUrl.startsWith("http")) {
    return false;
  }
  try {
    const { hostname } = new URL(sourceUrl);
    return SUPPORTED_HOSTS.some(host => hostname.endsWith(host));
  } catch {
    return false;
  }
};

export const buildOptimizedImageUrl = ({
  quality = DEFAULT_QUALITY,
  src,
  width,
}: {
  quality?: number;
  src: string;
  width: number;
}): string => {
  if (!shouldOptimise(src)) {
    return src;
  }
  const parameters = new URLSearchParams({
    q: String(quality),
    url: src,
    w: String(width),
  });
  return `${OPTIMIZED_PATH_PREFIX}?${parameters.toString()}`;
};

export const buildOptimizedImageSourceSet = ({
  quality = DEFAULT_QUALITY,
  src,
  widths,
}: {
  quality?: number;
  src: string;
  widths: number[];
}): string | undefined => {
  if (!shouldOptimise(src)) {
    return;
  }
  return widths
    .map(
      width => `${buildOptimizedImageUrl({ quality, src, width })} ${width}w`,
    )
    .join(", ");
};

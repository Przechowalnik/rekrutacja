import { E_Language } from "~/models/enums";

const ENGLISH_PREFIX = `/${E_Language.EN.toLowerCase()}`;

export type T_SitemapUrl = {
  changefreq: "daily" | "monthly" | "weekly" | "yearly";
  lastmod?: string;
  path: string;
  priority: string;
};

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const generateUrlEntry = (
  baseUrl: string,
  url: T_SitemapUrl,
): string => {
  const plPath = url.path;
  const enPath =
    url.path === "/" ? ENGLISH_PREFIX : `${ENGLISH_PREFIX}${url.path}`;

  const lastmodTag = url.lastmod
    ? `\n    <lastmod>${escapeXml(url.lastmod)}</lastmod>`
    : "";

  return `
  <url>
    <loc>${escapeXml(`${baseUrl}${plPath}`)}</loc>
    <xhtml:link rel="alternate" hreflang="pl" href="${escapeXml(`${baseUrl}${plPath}`)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(`${baseUrl}${enPath}`)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${baseUrl}${plPath}`)}" />${lastmodTag}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>
  <url>
    <loc>${escapeXml(`${baseUrl}${enPath}`)}</loc>
    <xhtml:link rel="alternate" hreflang="pl" href="${escapeXml(`${baseUrl}${plPath}`)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(`${baseUrl}${enPath}`)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${baseUrl}${plPath}`)}" />${lastmodTag}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
};

export const wrapSitemapXml = (
  entries: string,
): string => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}
</urlset>`;

export const wrapSitemapIndex = (
  baseUrl: string,
  files: Array<{ lastmod?: string; loc: string }>,
): string => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files
  .map(file => {
    const lastmodTag = file.lastmod
      ? `\n    <lastmod>${escapeXml(file.lastmod)}</lastmod>`
      : "";
    return `  <sitemap>
    <loc>${escapeXml(`${baseUrl}${file.loc}`)}</loc>${lastmodTag}
  </sitemap>`;
  })
  .join("\n")}
</sitemapindex>`;

export const SITEMAP_RESPONSE_HEADERS = {
  "Cache-Control": "public, max-age=3600",
  "Content-Type": "application/xml",
};

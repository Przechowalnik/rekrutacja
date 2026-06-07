import dayjs from "dayjs";
import { LoaderFunction } from "react-router";

import {
  SITEMAP_RESPONSE_HEADERS,
  wrapSitemapIndex,
} from "~/data/sitemap.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const now = dayjs().toISOString();

  const sitemapIndexXml = wrapSitemapIndex(baseUrl, [
    { lastmod: now, loc: "/sitemap-pages.xml" },
    { lastmod: now, loc: "/sitemap-cities.xml" },
    { lastmod: now, loc: "/sitemap-categories.xml" },
    { lastmod: now, loc: "/sitemap-blog.xml" },
  ]);

  return new Response(sitemapIndexXml, {
    headers: SITEMAP_RESPONSE_HEADERS,
  });
};

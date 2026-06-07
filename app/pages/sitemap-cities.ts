import { LoaderFunction } from "react-router";

import { E_Routes, getRoute } from "~/constants/routes";
import { database } from "~/data/database.server";
import {
  generateUrlEntry,
  SITEMAP_RESPONSE_HEADERS,
  T_SitemapUrl,
  wrapSitemapXml,
} from "~/data/sitemap.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const cities = await database.city.findMany({
    select: { nameSearch: true },
  });

  const paths: T_SitemapUrl[] = cities.map(city => ({
    changefreq: "weekly",
    path: getRoute({
      extraPath: `/${city.nameSearch}`,
      route: E_Routes.cities,
    }),
    priority: "0.7",
  }));

  const sitemapXml = wrapSitemapXml(
    paths.map(item => generateUrlEntry(baseUrl, item)).join(""),
  );

  return new Response(sitemapXml, {
    headers: SITEMAP_RESPONSE_HEADERS,
  });
};

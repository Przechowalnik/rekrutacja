import { LoaderFunction } from "react-router";

import { E_Routes, getRoute } from "~/constants/routes";
import { database } from "~/data/database.server";
import {
  generateUrlEntry,
  SITEMAP_RESPONSE_HEADERS,
  T_SitemapUrl,
  wrapSitemapXml,
} from "~/data/sitemap.server";
import { E_ListingCategorySlug } from "~/models/enums";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const allCategorySlugs: string[] = Object.values(E_ListingCategorySlug);

  const paths: T_SitemapUrl[] = allCategorySlugs.map(slug => ({
    changefreq: "weekly",
    path: getRoute({
      extraPath: `/${slug}`,
      route: E_Routes.search,
    }),
    priority: "0.9",
  }));

  const cities = await database.city.findMany({
    select: { nameSearch: true },
  });

  for (const slug of allCategorySlugs) {
    for (const city of cities) {
      paths.push({
        changefreq: "daily",
        path: getRoute({
          extraPath: `/${slug}/${city.nameSearch}`,
          route: E_Routes.search,
        }),
        priority: "0.7",
      });
    }
  }

  const sitemapXml = wrapSitemapXml(
    paths.map(item => generateUrlEntry(baseUrl, item)).join(""),
  );

  return new Response(sitemapXml, {
    headers: SITEMAP_RESPONSE_HEADERS,
  });
};

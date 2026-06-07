import { LoaderFunction } from "react-router";

import { E_Routes, getRoute } from "~/constants/routes";
import {
  generateUrlEntry,
  SITEMAP_RESPONSE_HEADERS,
  T_SitemapUrl,
  wrapSitemapXml,
} from "~/data/sitemap.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const paths: T_SitemapUrl[] = [
    {
      changefreq: "daily",
      path: getRoute({ route: E_Routes.home }),
      priority: "1.0",
    },
    {
      changefreq: "weekly",
      path: getRoute({ route: E_Routes.search }),
      priority: "0.9",
    },
    {
      changefreq: "weekly",
      path: getRoute({ route: E_Routes.cities }),
      priority: "0.9",
    },
    {
      changefreq: "monthly",
      path: getRoute({ route: E_Routes.aboutUs }),
      priority: "0.6",
    },
    {
      changefreq: "monthly",
      path: getRoute({ route: E_Routes.contact }),
      priority: "0.6",
    },
    {
      changefreq: "monthly",
      path: getRoute({ route: E_Routes.help }),
      priority: "0.6",
    },
    {
      changefreq: "monthly",
      path: getRoute({ route: E_Routes.howToAddListing }),
      priority: "0.5",
    },
    {
      changefreq: "monthly",
      path: getRoute({ route: E_Routes.howToSearchListing }),
      priority: "0.5",
    },
    {
      changefreq: "yearly",
      path: getRoute({ route: E_Routes.privacyPolicy }),
      priority: "0.3",
    },
    {
      changefreq: "yearly",
      path: getRoute({ route: E_Routes.termsAndConditions }),
      priority: "0.3",
    },
  ];

  const sitemapXml = wrapSitemapXml(
    paths.map(item => generateUrlEntry(baseUrl, item)).join(""),
  );

  return new Response(sitemapXml, {
    headers: SITEMAP_RESPONSE_HEADERS,
  });
};

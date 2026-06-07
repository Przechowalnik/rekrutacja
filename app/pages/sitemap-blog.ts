import dayjs from "dayjs";
import { LoaderFunction } from "react-router";

import { E_Routes, getRoute } from "~/constants/routes";
import { getAllBlogPostsForRSS } from "~/data/blog.server";
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
      changefreq: "weekly",
      path: getRoute({ route: E_Routes.blogPosts }),
      priority: "0.7",
    },
  ];

  const blogPosts = await getAllBlogPostsForRSS();

  for (const post of blogPosts) {
    if (!post?.slug) {
      continue;
    }

    paths.push({
      changefreq: "monthly",
      lastmod: post.updatedAt ? dayjs(post.updatedAt).toISOString() : undefined,
      path: getRoute({
        extraPath: `/${post.slug}`,
        route: E_Routes.blogPosts,
      }),
      priority: "0.6",
    });
  }

  const sitemapXml = wrapSitemapXml(
    paths.map(item => generateUrlEntry(baseUrl, item)).join(""),
  );

  return new Response(sitemapXml, {
    headers: SITEMAP_RESPONSE_HEADERS,
  });
};

import { TFunction } from "i18next";
import { LoaderFunction, LoaderFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { getAllBlogPostsForRSS } from "~/data/blog.server";
import { E_LanguagesServer } from "~/data/models.server";
import i18next from "~/localization/i18n.server";

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const posts = await getAllBlogPostsForRSS();

  const t: TFunction<"blogPosts", undefined> = await i18next.getFixedT(
    E_LanguagesServer.PL.toLowerCase(),
    namespaces.blogPosts,
  );

  const url = new URL(request.url);
  const origin = url.origin;

  const rss = `
    <?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
      <channel>
        <title>${t("rss.title")}</title>
        <link>${origin}/blog</link>
        <description>${t("rss.description")}</description>
        <language>${E_LanguagesServer.PL.toLowerCase()}</language>

        ${posts
          .map(
            post => `
            <item>
              <title><![CDATA[${post.title}]]></title>
              <link>${origin}/blog/${post.slug}</link>
              <guid>${origin}/blog/${post.slug}</guid>
              <description><![CDATA[${post.description}]]></description>
              <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
              <content:encoded><![CDATA[${post.content}]]></content:encoded>
            </item>
          `,
          )
          .join("")}
      </channel>
    </rss>
  `.trim();

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};

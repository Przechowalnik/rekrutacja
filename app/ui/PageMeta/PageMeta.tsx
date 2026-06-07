import dayjs from "dayjs";
import { memo, type PropsWithChildren, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes, routes, T_RouteName } from "~/constants/routes";
import { getCompanySeoImage } from "~/constants/seo";
import { useNonce } from "~/context/NonceContext";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { T_BlogPost } from "~/models/blogPost";
import { E_Language } from "~/models/enums";
import { safeHtml } from "~/utilities/functions";

import { T_BreadcrumbsRoute } from "../Breadcrumbs";
import { SeoFaqSection } from "./SeoFaqSection";

type T_JsonLdOrganization = {
  "@context": string;
  "@type": string;
  logo: string;
  name: string;
  sameAs: string[];
  url: string;
};

type T_JsonLdWebSite = {
  "@context": string;
  "@type": string;
  inLanguage: string;
  name: string;
  url: string;
};

type T_JsonLdStructured = {
  "@context": string;
  "@type": string;
  description: string;
  isPart: {
    "@type": string;
    name: string;
  };
  name: string;
  url: string;
};

type T_JsonLdBreadcrumbList = {
  "@context": string;
  "@type": string;
  itemListElement: {
    "@type": string;
    item: string;
    name: string;
    position: number;
  }[];
};

type T_JsonLdBlogAuthor = {
  "@type": string;
  name: string;
  url: string;
};

type T_JsonLdBlog = {
  "@context": string;
  "@type": string;
  articleBody: string;
  author?: T_JsonLdBlogAuthor[];
  dateModified: string;
  datePublished: string;
  description?: string;
  headline: string;
  image?: string[];
  inLanguage: string;
  mainEntityOfPage?: {
    "@id": string;
    "@type": string;
  };
  publisher:
    | {
        "@type": string;
        logo: { "@type": string; url: string };
        name: string;
      }
    | string;
};

type T_JsonLdFaqMainEntity = {
  "@type": string;
  acceptedAnswer: {
    "@type": string;
    text: string;
  };
  name: string;
};

type T_JsonLdFaq = {
  "@context": string;
  "@type": string;
  description: string;
  mainEntity: T_JsonLdFaqMainEntity[];
};

type T_SeoFaqItem = {
  description: string;
  title: string;
};

export type T_SeoFaq = {
  customDescription?: string;
  faq: T_SeoFaqItem[];
  hideInlineSection?: boolean;
  route: T_RouteName;
};

export type T_SeoImage = {
  alt?: string;
  height?: string;
  type?: "image/gif" | "image/jpeg" | "image/png" | "mage/webp";
  url?: string;
  width?: string;
};

export type T_SeoSocials = {
  article?: {
    author?: string;
    modifiedTime?: string;
    publishedTime?: string;
  };
  description?: string;
  image?: T_SeoImage;
  title?: string;
  twitterCreator?: string;
  twitterSite?: string;
  type?:
    | "article"
    | "event"
    | "product"
    | "profile"
    | "video.episode"
    | "video.movie"
    | "video.other"
    | "website";
  updatedTime?: string;
  url?: string;
};

type T_PageMeta = {
  customCanonical?: string;
  customDescription?: string;
  customJsonLd?: Array<Record<string, unknown>>;
  customTitle?: string;
  robotsNoIndex?: boolean;
  route: "default" | T_RouteName;
  seoBlog?: T_BlogPost;
  seoBreadcrumbs?: T_BreadcrumbsRoute[];
  seoFaq?: T_SeoFaq;
  socials?: T_SeoSocials;
  withJsonLdStructured?: boolean;
};

const PageMeta = ({
  children,
  customCanonical,
  customDescription,
  customJsonLd,
  customTitle,
  robotsNoIndex,
  route,
  seoBlog,
  seoBreadcrumbs,
  seoFaq,
  socials,
  withJsonLdStructured,
}: PropsWithChildren<T_PageMeta>) => {
  const [originUrl, setOriginUrl] = useState<null | string>(null);
  const nonce = useNonce();
  const location = useLocation();
  const { getLocalizedRoute } = useLocalizedRoute();

  const currentPath = location.pathname;
  const isEnglish = currentPath.startsWith("/en");
  const canonicalPath =
    customCanonical ??
    (route === "default" ? "/" : getLocalizedRoute({ route }));
  const polishPath = isEnglish
    ? canonicalPath.replace(/^\/en/, "") || "/"
    : canonicalPath;
  const englishPath = isEnglish
    ? canonicalPath
    : `/${E_Language.EN.toLowerCase()}${canonicalPath}`;

  const { t } = useTranslation(namespaces.seo);
  const { t: tCommon } = useTranslation(namespaces.common);

  useEffect(() => {
    if (seoBreadcrumbs?.length === 0) {
      return;
    }

    setOriginUrl(globalThis.location.origin);
  }, [seoBreadcrumbs]);

  const validRouteSeo = route === "default" ? E_Routes.home : route;

  const title =
    customTitle ??
    (route
      ? (t(`meta.${validRouteSeo}.title`, {
          companyName: tCommon("company.name"),
        }) ?? undefined)
      : undefined);

  const description =
    customDescription ??
    (route
      ? t(`meta.${validRouteSeo}.description`, {
          companyName: tCommon("company.name"),
        })
      : undefined) ??
    undefined;

  const validSocials: T_SeoSocials = socials ?? {
    description,
    image: getCompanySeoImage({
      tCommon,
      tSeo: t,
    }),
    title,
    twitterCreator: links.twitter.creator,
    twitterSite: links.twitter.site,
    type: "website",
    url: `${links.baseUrl}${getLocalizedRoute({
      route: validRouteSeo,
    })}`,
  };

  const organizationSchema: T_JsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    logo: `${tCommon("company.link")}/logo/logo-purple-social.png`,
    name: tCommon("company.name"),
    sameAs: [
      links.facebook.url,
      links.instagram,
      links.linkedin,
      links.youtube,
      links.tiktok,
      links.twitter.site,
    ],
    url: tCommon("company.link"),
  };

  const webSiteSchema: T_JsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    inLanguage: isEnglish ? "en" : "pl-PL",
    name: tCommon("company.name"),
    url: tCommon("company.link"),
  };

  const jsonLd: Array<
    | Record<string, unknown>
    | T_JsonLdBlog
    | T_JsonLdBreadcrumbList
    | T_JsonLdFaq
    | T_JsonLdOrganization
    | T_JsonLdStructured
    | T_JsonLdWebSite
  > = [organizationSchema, webSiteSchema];

  if (withJsonLdStructured && t("jsonLdStructured.name")) {
    const jsonLdStructured: T_JsonLdStructured = {
      "@context": "http://schema.org",
      "@type": "WebPage",
      description: t("jsonLdStructured.description") ?? "",
      isPart: {
        "@type": "Organization",
        name: t("jsonLdStructured.isPartOfName") ?? "",
      },
      name: t("jsonLdStructured.name") ?? "",
      url: t("jsonLdStructured.url") ?? "",
    };

    jsonLd.push(jsonLdStructured);
  }

  if (seoBreadcrumbs && originUrl) {
    const jsonLdBreadcrumbsRoutes: T_JsonLdBreadcrumbList = {
      "@context": "http://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: seoBreadcrumbs.map((itemRoute, index) => {
        const isTypeRoute = typeof itemRoute === "string";
        let titleBreadcrumb = "";
        let route: T_RouteName = E_Routes.home;
        if (isTypeRoute) {
          route = itemRoute;
          titleBreadcrumb = tCommon(`breadcrumbs.${route}`) ?? "-";
        } else {
          if (itemRoute.route) {
            route = itemRoute.route;
          }
          titleBreadcrumb =
            typeof itemRoute.customTitle === "string"
              ? itemRoute.customTitle
              : (tCommon(`breadcrumbs.${route}`) ?? "-");
        }

        return {
          "@type": "ListItem",
          item: `${originUrl}${routes[route]}`,
          name: titleBreadcrumb,
          position: index + 1,
        };
      }),
    };

    jsonLd.push(jsonLdBreadcrumbsRoutes);
  }

  if (seoBlog) {
    const blogPageUrl = `${links.baseUrl}${canonicalPath}`;
    const companyName = tCommon("company.name");
    const jsonLdBlog: T_JsonLdBlog = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      articleBody: seoBlog.descriptionSeo ?? "",
      author: [
        {
          "@type": "Organization",
          name: companyName,
          url: links.baseUrl,
        },
      ],
      dateModified: dayjs(seoBlog.updatedAt).toISOString(),
      datePublished: dayjs(seoBlog.createdAt).toISOString(),
      description: seoBlog.descriptionSeo ?? "",
      headline: seoBlog?.titleSeo ?? "",
      inLanguage: isEnglish ? "en" : "pl-PL",
      mainEntityOfPage: {
        "@id": blogPageUrl,
        "@type": "WebPage",
      },
      publisher: {
        "@type": "Organization",
        logo: {
          "@type": "ImageObject",
          url: `${links.baseUrl}/logo/logo-purple-social.png`,
        },
        name: companyName,
      },
    };

    jsonLd.push(jsonLdBlog);
  }

  if (seoFaq && seoFaq.faq.length > 0) {
    const mainEntity: T_JsonLdFaqMainEntity[] = seoFaq.faq.map(item => {
      return {
        "@type": "Question",
        acceptedAnswer: {
          "@type": "Answer",
          text: item?.description ?? "",
        },
        name: item?.title ?? "",
      };
    });

    const jsonLdFaq: T_JsonLdFaq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      description:
        seoFaq?.customDescription ?? t(`jsonLdFaq.${seoFaq.route}.description`),
      mainEntity,
    };

    jsonLd.push(jsonLdFaq);
  }

  if (customJsonLd && customJsonLd.length > 0) {
    for (const item of customJsonLd) {
      jsonLd.push(item);
    }
  }

  return (
    <>
      {links.baseUrl && route !== "default" && (
        <>
          <link
            href={`${links.baseUrl}${
              customCanonical ??
              getLocalizedRoute({
                route,
              })
            }`}
            rel="canonical"
          />
          <link
            href={`${links.baseUrl}${polishPath}`}
            hrefLang="pl"
            rel="alternate"
          />
          <link
            href={`${links.baseUrl}${englishPath}`}
            hrefLang="en"
            rel="alternate"
          />
          <link
            href={`${links.baseUrl}${polishPath}`}
            hrefLang="x-default"
            rel="alternate"
          />
        </>
      )}
      <meta
        content={robotsNoIndex ? "noindex, follow" : "index, follow"}
        name="robots"
      />
      {typeof title === "string" && (
        <>
          <title>{title}</title>
          <meta content={title} name="application-name" />
          <meta content={title} name="apple-mobile-web-app-title" />
          <meta content={title} property="og:title" />
          <meta content={title} name="twitter:title" />
        </>
      )}
      {typeof description === "string" && (
        <>
          <meta content={description} property="og:description" />
          <meta content={description} name="description" />
          <meta content={description} name="twitter:description" />
        </>
      )}
      {jsonLd.length > 0 && (
        <script
          dangerouslySetInnerHTML={{
            __html: safeHtml({
              element: JSON.stringify(jsonLd),
            }),
          }}
          nonce={nonce}
          suppressHydrationWarning
          type="application/ld+json"
        />
      )}
      {validSocials && (
        <>
          {validSocials?.title && (
            <>
              <meta content={validSocials.title} property="og:title" />
              <meta content={validSocials.title} name="twitter:title" />
            </>
          )}
          {validSocials?.description && (
            <>
              <meta
                content={validSocials.description}
                property="og:description"
              />
              <meta
                content={validSocials.description}
                name="twitter:description"
              />
            </>
          )}
          {validSocials?.image?.url && (
            <>
              <meta content={validSocials.image.url} property="og:image" />
              <meta content={validSocials.image.url} name="twitter:image" />
            </>
          )}
          {validSocials?.image?.type && (
            <meta content={validSocials.image.type} property="og:image:type" />
          )}
          {validSocials?.image?.alt && (
            <>
              <meta content={validSocials.image.alt} property="og:image:alt" />
              <meta content={validSocials.image.alt} name="twitter:image:alt" />
            </>
          )}
          {validSocials?.image?.width && validSocials?.image?.height && (
            <>
              <meta
                content={validSocials.image.width}
                property="og:image:width"
              />
              <meta
                content={validSocials.image.height}
                property="og:image:height"
              />
            </>
          )}
          {validSocials?.url && (
            <meta content={validSocials.url} property="og:url" />
          )}
          {validSocials?.type && (
            <meta content={validSocials.type} property="og:type" />
          )}
          {validSocials?.twitterSite && (
            <meta content={validSocials.twitterSite} name="twitter:site" />
          )}
          {validSocials?.twitterCreator && (
            <meta
              content={validSocials.twitterCreator}
              name="twitter:creator"
            />
          )}
          {validSocials?.updatedTime && (
            <meta
              content={validSocials.updatedTime}
              property="og:updated_time"
            />
          )}
          {validSocials?.article?.author && (
            <meta
              content={validSocials.article.author}
              property="article:author"
            />
          )}
          {validSocials?.article?.modifiedTime && (
            <meta
              content={validSocials.article.modifiedTime}
              property="article:modified_time"
            />
          )}
          {validSocials?.article?.publishedTime && (
            <meta
              content={validSocials.article.publishedTime}
              property="article:published_time"
            />
          )}
          <meta content={links.facebook.appId} property="fb:app_id" />
          <meta content={tCommon("company.name")} name="author" />
          <meta content={isEnglish ? "en_US" : "pl_PL"} property="og:locale" />
          <meta
            content={isEnglish ? "pl_PL" : "en_US"}
            property="og:locale:alternate"
          />
          <meta content={tCommon("company.name")} property="og:site_name" />
          <meta content="summary_large_image" name="twitter:card" />
        </>
      )}
      {children}
      {seoFaq &&
        !seoFaq.hideInlineSection &&
        (seoFaq?.faq ?? [])?.length > 0 && (
          <SeoFaqSection
            description={
              seoFaq?.customDescription ??
              t(`jsonLdFaq.${seoFaq?.route}.description`)
            }
            items={seoFaq?.faq ?? []}
          />
        )}
    </>
  );
};
export default memo(PageMeta);

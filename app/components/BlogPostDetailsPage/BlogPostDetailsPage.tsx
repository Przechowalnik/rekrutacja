import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { T_BlogPost } from "~/models/blogPost";
import { Section } from "~/ui/Section";
import { TextEditorShow } from "~/ui/TextEditorShow";

type T_BlogPostDetailsPage = {
  blogPost: T_BlogPost;
};

export const BlogPostDetailsPage = ({ blogPost }: T_BlogPostDetailsPage) => {
  const { t } = useTranslation(namespaces.blogPostDetails);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();

  return (
    <Section
      breadcrumbs={[
        E_Routes.home,
        E_Routes.blogPosts,
        {
          customHref: getLocalizedRoute({
            extraPath: `/${blogPost.slug}`,
            route: E_Routes.blogPostDetails,
          }),
          customTitle: blogPost.titleSeo,
        },
      ]}
      description={blogPost.description}
      pageMeta={{
        customDescription: blogPost.descriptionSeo,
        customTitle: t("customMetaTitle", {
          companyName: tCommon("company.name"),
          text: blogPost.titleSeo,
        }),
        route: E_Routes.blogPostDetails,
        seoBlog: blogPost,
        socials: {
          article: {
            modifiedTime: dayjs(blogPost.updatedAt).toISOString(),
            publishedTime: dayjs(blogPost.createdAt).toISOString(),
          },
          description: blogPost.descriptionSeo,
          title: blogPost.titleSeo,
          type: "article",
        },
      }}
      size="lg"
      title={blogPost.title}
      withHTML
    >
      <article>
        <time
          dateTime={dayjs(blogPost.createdAt).toISOString()}
          style={{ display: "none" }}
        >
          {dayjs(blogPost.createdAt).toISOString()}
        </time>
        <TextEditorShow content={blogPost.content} />
      </article>
    </Section>
  );
};

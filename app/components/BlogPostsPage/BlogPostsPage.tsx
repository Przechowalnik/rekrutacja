import { Flex } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { T_BlogPosts } from "~/models/blogPosts";
import { CardBlogPost } from "~/ui/CardBlogPost";
import { CardNoData } from "~/ui/CardNoData";
import { Section } from "~/ui/Section";

type T_BlogPostsPage = {
  blogPosts: T_BlogPosts;
};

export const BlogPostsPage = ({ blogPosts }: T_BlogPostsPage) => {
  const { t } = useTranslation(namespaces.blogPosts);

  const mapBlogs = blogPosts.map(item => {
    return <CardBlogPost blogPost={item} key={`blog_${item.id}`} />;
  });

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.blogPosts]}
      description={t("description")}
      pageMeta={{
        route: E_Routes.blogPosts,
      }}
      size="lg"
      title={t("title")}
      withHTML
    >
      <Flex align="center" gap={24} justify="center" wrap="wrap">
        {blogPosts?.length === 0 && <CardNoData />}
        {blogPosts?.length > 0 && mapBlogs}
      </Flex>
    </Section>
  );
};

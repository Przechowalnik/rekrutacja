import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { T_BlogPosts, Z_BlogPosts } from "~/models/blogPosts";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardBlogPost } from "~/ui/CardBlogPost";
import { InfiniteDataQueryPagination } from "~/ui/InfiniteDataQueryPagination";
import { Section } from "~/ui/Section";

type T_AdminBlogPostsPage = {
  blogPosts: T_BlogPosts;
  nextPage: null | number;
  totalPages: null | number | undefined;
};

export const AdminBlogPostsPage = ({
  blogPosts,
  nextPage,
  totalPages,
}: T_AdminBlogPostsPage) => {
  const { t } = useTranslation(namespaces.adminBlogPosts);

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.admin, E_Routes.adminBlogPosts]}
      buttons={
        <>
          <ButtonArrowLeft routeTo={E_Routes.admin} textGoBack />
          <Button routeTo={E_Routes.adminBlogPostNew}>{t("buttonNew")}</Button>
        </>
      }
      pageMeta={{
        route: E_Routes.adminBlogPosts,
      }}
      size="md"
      title={t("title")}
      withHTML
    >
      <InfiniteDataQueryPagination
        data={{
          items: blogPosts,
          nextPage: nextPage,
          totalPages: totalPages,
        }}
        noMoreDataDescription={t("noData")}
        renderItem={item => {
          return (
            <CardBlogPost blogPost={item} isAdmin key={`blog_${item.id}`} />
          );
        }}
        schema={Z_BlogPosts}
      />
    </Section>
  );
};

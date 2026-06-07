import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { T_BlogPost } from "~/models/blogPost";
import { replaceDateToYearMonthHoursMinutesInWordsDay } from "~/utilities/date";

import { Card } from "../Card";
import { Text } from "../Text";

type T_CardBlogPost = {
  blogPost: T_BlogPost;
  isAdmin?: boolean;
};

const CardBlogPostToMemoize = ({ blogPost, isAdmin }: T_CardBlogPost) => {
  const { t } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();

  return (
    <Card
      customButtonLabel={t("cardBlogPost.button")}
      href={getLocalizedRoute({
        extraPath: isAdmin ? `/${blogPost.id}` : `/${blogPost.slug}`,
        route: isAdmin ? E_Routes.adminBlogPostEdit : E_Routes.blogPostDetails,
      })}
      isEditable
      minHeight={{
        base: "auto",
        xs: 330,
      }}
      title={blogPost.title}
    >
      <Text c="white">{blogPost.description}</Text>
      {isAdmin && (
        <>
          <Text c="white">
            {t("cardBlogPost.updatedAt")}:{" "}
            <b>
              {replaceDateToYearMonthHoursMinutesInWordsDay({
                date: blogPost.updatedAt.toString(),
                withNbsp: false,
              })}
            </b>
          </Text>
          <Text c="white">
            {t("cardBlogPost.createdAt")}:{" "}
            <b>
              {replaceDateToYearMonthHoursMinutesInWordsDay({
                date: blogPost.createdAt.toString(),
                withNbsp: false,
              })}
            </b>
          </Text>
        </>
      )}
    </Card>
  );
};

export const CardBlogPost = memo(CardBlogPostToMemoize);

import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useUser } from "~/hooks/useUser";
import { E_Roles } from "~/models/enums";
import { Button } from "~/ui/Button";
import { ButtonWrapper } from "~/ui/ButtonWrapper";
import { Section } from "~/ui/Section";

export const AdminPage = () => {
  const { t } = useTranslation(namespaces.admin);
  const { user } = useUser();

  const isAdminSuper = user?.role === E_Roles.ADMIN_SUPER;

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.admin]}
      pageMeta={{
        route: E_Routes.admin,
      }}
      size="md"
      title={t("title")}
    >
      <ButtonWrapper withMobileReverse={false} withTopPadding={false}>
        <Button
          disabled
          fullWidth
          routeTo={E_Routes.admin}
          size="lg"
          variant="light"
        >
          {t("buttonClients")}
        </Button>
        <Button
          fullWidth
          routeTo={E_Routes.adminBlogPosts}
          size="lg"
          variant="light"
        >
          {t("buttonEmails")}
        </Button>
        <Button
          fullWidth
          routeTo={E_Routes.adminBlogPosts}
          size="lg"
          variant="light"
        >
          {t("buttonBlog")}
        </Button>
        <Button
          fullWidth
          routeTo={E_Routes.adminBugs}
          size="lg"
          variant="light"
        >
          {t("buttonBugs")}
        </Button>
        <Button
          fullWidth
          routeTo={E_Routes.adminReports}
          size="lg"
          variant="light"
        >
          {t("buttonReports")}
        </Button>
        <Button
          fullWidth
          routeTo={E_Routes.adminCoupons}
          size="lg"
          variant="light"
        >
          {t("buttonPromotionCodes")}
        </Button>
        {isAdminSuper && (
          <>
            <Button
              fullWidth
              routeTo={E_Routes.adminProducts}
              size="lg"
              variant="light"
            >
              {t("buttonProducts")}
            </Button>
            <Button
              fullWidth
              routeTo={E_Routes.adminPlans}
              size="lg"
              variant="light"
            >
              {t("buttonPlans")}
            </Button>
            <Button
              fullWidth
              routeTo={E_Routes.adminExchanges}
              size="lg"
              variant="light"
            >
              {t("buttonExchanges")}
            </Button>
            <Button
              fullWidth
              routeTo={E_Routes.adminSettings}
              size="lg"
              variant="light"
            >
              {t("buttonSettings")}
            </Button>
          </>
        )}
      </ButtonWrapper>
    </Section>
  );
};

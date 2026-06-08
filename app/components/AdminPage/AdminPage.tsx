import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { Button } from "~/ui/Button";
import { ButtonWrapper } from "~/ui/ButtonWrapper";
import { Section } from "~/ui/Section";

export const AdminPage = () => {
  const { t } = useTranslation(namespaces.admin);

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
          routeTo={E_Routes.adminMarketingEmail}
          size="lg"
          variant="light"
        >
          {t("buttonEmails")}
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
      </ButtonWrapper>
    </Section>
  );
};

import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { Title } from "~/ui/Title";

export const AccessibilityPage = () => {
  const { t } = useTranslation(namespaces.accessibility);
  const { t: tCommon } = useTranslation(namespaces.common);

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.accessibility]}
      pageMeta={{
        route: E_Routes.accessibility,
      }}
      size="md"
      title={t("title1")}
    >
      <Text>
        {t("paragraph1", {
          companyName: tCommon("company.name"),
        })}
      </Text>
      <Title order={2} pt={64} size="h3">
        {t("title2")}
      </Title>
      <Text pt={24}>
        {t("paragraph2", {
          companyName: tCommon("company.name"),
        })}
      </Text>
      <Title order={2} pt={64} size="h3">
        {t("title3")}
      </Title>
      <Text pt={24}>
        {t("paragraph3", {
          companyName: tCommon("company.name"),
        })}
      </Text>
      <Title order={3} pt={64} size="h3">
        {t("title4")}
      </Title>
      <Text pt={24}>
        {t("paragraph4", {
          companyName: tCommon("company.name"),
        })}
      </Text>
      <Text pb={32} pt={24} withTextsToUi>
        {t("paragraph5")}
      </Text>
    </Section>
  );
};

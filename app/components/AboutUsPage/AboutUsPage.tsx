import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { List } from "~/ui/List";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";

export const AboutUsPage = () => {
  const { t } = useTranslation(namespaces.aboutUs);
  const { t: tCommon } = useTranslation(namespaces.common);

  const customJsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        mainEntity: {
          "@type": "Organization",
          name: tCommon("company.name"),
          sameAs: [],
          url: links.baseUrl,
        },
        name: t("title"),
      },
    ],
    [t, tCommon],
  );

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.aboutUs]}
      pageMeta={{
        customJsonLd,
        route: E_Routes.aboutUs,
      }}
      size="md"
      title={t("title")}
    >
      <Text withHTML>{t("paragraph1")}</Text>
      <Text pt={24} withHTML>
        {t("paragraph2")}
      </Text>
      <Text
        c="violet"
        center
        component="h2"
        fw="bold"
        py={64}
        size="xl"
        variant="gradient"
      >
        {t("paragraph3")}
      </Text>
      <Text component="h3" fw="bold" pb={12}>
        {t("paragraph4")}
      </Text>
      <List
        items={[
          t("list.list1"),
          t("list.list2"),
          t("list.list3"),
          t("list.list4"),
        ]}
        spacing={8}
      />
    </Section>
  );
};

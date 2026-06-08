import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { Section } from "~/ui/Section";

const CONTACT_EMAIL = "informacja@do-pracy.pl";

export const ContactPage = () => {
  const { t } = useTranslation(namespaces.contact);
  const { t: tCommon } = useTranslation(namespaces.common);

  const customJsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        mainEntity: {
          "@type": "Organization",
          contactPoint: {
            "@type": "ContactPoint",
            areaServed: "PL",
            availableLanguage: ["pl", "en"],
            contactType: "customer support",
            email: CONTACT_EMAIL,
          },
          email: CONTACT_EMAIL,
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
      breadcrumbs={[E_Routes.home, E_Routes.contact]}
      description={t("description")}
      pageMeta={{
        customJsonLd,
        route: E_Routes.contact,
      }}
      size="md"
      title={t("title")}
      withHTML={false}
      withTextsToUi
    ></Section>
  );
};

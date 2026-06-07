import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { Section } from "~/ui/Section";

const CONTACT_EMAIL = "kontakt@maszbox.pl";

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
          sameAs: [
            links.facebook.url,
            links.instagram,
            links.linkedin,
            links.youtube,
            links.tiktok,
            links.twitter.site,
          ],
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

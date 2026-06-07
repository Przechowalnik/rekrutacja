import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { BannerIntroRent } from "~/ui/BannerIntroRent";
import { Section } from "~/ui/Section";
import { isFreeListings } from "~/utilities/flags";

export const HowToAddListing = () => {
  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);

  const customJsonLd = useMemo(() => {
    const rawSteps: Array<{ name: string; text: string }> = [
      {
        name: t("bannerIntroRent.list1.title"),
        text: t("bannerIntroRent.list1.paragraph"),
      },
      {
        name: t("bannerIntroRent.list2.title"),
        text: t("bannerIntroRent.list2.paragraph"),
      },
      ...(isFreeListings()
        ? []
        : [
            {
              name: t("bannerIntroRent.list3.title"),
              text: t("bannerIntroRent.list3.paragraph"),
            },
          ]),
      {
        name: t("bannerIntroRent.list4.title"),
        text: t("bannerIntroRent.list4.paragraph"),
      },
    ];
    const steps = rawSteps.map((step, index) => ({
      "@type": "HowToStep",
      name: step.name,
      position: index + 1,
      text: step.text,
    }));
    return [
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        description: tSeo("meta.howToAddListing.description", {
          companyName: t("company.name"),
        }),
        name: tSeo("meta.howToAddListing.title", {
          companyName: t("company.name"),
        }),
        step: steps,
        totalTime: "PT3M",
      },
    ];
  }, [t, tSeo]);

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.howToAddListing]}
      pageMeta={{
        customJsonLd,
        route: E_Routes.howToAddListing,
      }}
      size="lg"
      withBottomPadding={false}
      withTopPadding={false}
    >
      <BannerIntroRent smallTopPadding />
    </Section>
  );
};

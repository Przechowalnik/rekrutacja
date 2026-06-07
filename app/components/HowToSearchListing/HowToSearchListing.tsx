import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { BannerIntroSearch } from "~/ui/BannerIntroSearch";
import { Section } from "~/ui/Section";

export const HowToSearchListing = () => {
  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);

  const customJsonLd = useMemo(() => {
    const rawSteps: Array<{ name: string; text: string }> = [
      {
        name: t("bannerIntroSearch.list1.title"),
        text: t("bannerIntroSearch.list1.paragraph"),
      },
      {
        name: t("bannerIntroSearch.list2.title"),
        text: t("bannerIntroSearch.list2.paragraph"),
      },
      {
        name: t("bannerIntroSearch.list3.title", {
          buttonName: t("bannerIntroSearch.button"),
        }),
        text: t("bannerIntroSearch.list3.paragraph"),
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
        description: tSeo("meta.howToSearchListing.description", {
          companyName: t("company.name"),
        }),
        name: tSeo("meta.howToSearchListing.title", {
          companyName: t("company.name"),
        }),
        step: steps,
        totalTime: "PT1M",
      },
    ];
  }, [t, tSeo]);

  return (
    <Section
      breadcrumbs={[E_Routes.home, E_Routes.howToSearchListing]}
      pageMeta={{
        customJsonLd,
        route: E_Routes.howToSearchListing,
      }}
      size="lg"
      withBottomPadding={false}
      withTopPadding={false}
    >
      <BannerIntroSearch />
    </Section>
  );
};

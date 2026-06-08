import { Box } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { HomeLatestListingsSection } from "~/components/HomePage/HomeLatestListingsSection";
import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { T_Listings } from "~/models/listings";

import { SearchListingsFiltersSection } from "../GlobalLayout/SearchListingsFiltersSection";

type T_HomePage = {
  latestListings: T_Listings;
};

export const HomePage = ({ latestListings }: T_HomePage) => {
  const { t: tCommon } = useTranslation(namespaces.common);

  const customJsonLd = useMemo<Array<Record<string, unknown>>>(() => {
    const baseUrl = links.baseUrl;
    return [
      {
        "@context": "https://schema.org",
        "@id": `${baseUrl}#organization`,
        "@type": "Organization",
        logo: `${baseUrl}/icons/pwa-512x512.png`,
        name: tCommon("company.name"),
        sameAs: [],
        url: baseUrl,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        inLanguage: ["pl-PL", "en"],
        name: tCommon("company.name"),
        publisher: { "@id": `${baseUrl}#organization` },
        url: baseUrl,
      },
    ];
  }, [tCommon]);

  return (
    <>
      <SearchListingsFiltersSection
        pageMeta={{
          customJsonLd,
          customSeoBreadcrumbs: [E_Routes.home],
          route: E_Routes.home,
        }}
        withScrollToResults={false}
      />
      <Box w="100%">
        <HomeLatestListingsSection latestListings={latestListings} />
      </Box>
    </>
  );
};

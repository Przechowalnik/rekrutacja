import { Alert, Box, Flex } from "@mantine/core";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { HomeLatestListingsSection } from "~/components/HomePage/HomeLatestListingsSection";
import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useUserCookie } from "~/hooks/useUserCookie";
import { T_Listings } from "~/models/listings";
import { BannerIntroRent } from "~/ui/BannerIntroRent";
import { Button } from "~/ui/Button";
import { Collapse } from "~/ui/Collapse";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";

import { SearchListingsFiltersSection } from "../GlobalLayout/SearchListingsFiltersSection";

type T_HomePage = {
  latestListings: T_Listings;
};

export const HomePage = ({ latestListings }: T_HomePage) => {
  const { t } = useTranslation(namespaces.common);
  const { t: tCommon } = useTranslation(namespaces.common);
  const [showBanner, setShowBanner] = useState(true);
  const { userCookie } = useUserCookie();

  const customJsonLd = useMemo<Array<Record<string, unknown>>>(() => {
    const baseUrl = links.baseUrl;
    return [
      {
        "@context": "https://schema.org",
        "@id": `${baseUrl}#organization`,
        "@type": "Organization",
        logo: `${baseUrl}/logo/logo-purple-social.png`,
        name: tCommon("company.name"),
        sameAs: [
          links.facebook.url,
          links.instagram,
          links.linkedin,
          links.youtube,
          links.tiktok,
          links.twitter.site,
        ],
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

  const routeTo = (() => {
    if (!userCookie) {
      return E_Routes.loginFromCreateListing;
    }

    if (userCookie.userCompanyId) {
      return E_Routes.companyListingsNew;
    }

    return E_Routes.accountListingsNew;
  })();

  return (
    <>
      <Collapse opened={showBanner}>
        <Alert
          color="teal"
          onClose={() => setShowBanner(false)}
          withCloseButton
        >
          <Text c="teal" center fw="bold" size="md">
            {t("bannerIntroRent.informationFreeListings")}
          </Text>
          <Flex justify="center" pt={12}>
            <Button color="teal" routeTo={routeTo} size="sm" variant="filled">
              {t("bannerIntroRent.buttonAddListing")}
            </Button>
          </Flex>
        </Alert>
      </Collapse>
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
        <Section
          size="lg"
          withBottomPadding={false}
          withPageMeta={false}
          withTopPadding={false}
        >
          <BannerIntroRent />
        </Section>
      </Box>
    </>
  );
};

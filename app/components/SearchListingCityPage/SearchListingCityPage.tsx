import { Box, Flex } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { getCompanySeoImage } from "~/constants/seo";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { T_City } from "~/models/city";
import { T_CityCategoryCounts } from "~/models/cityCategoryCounts";
import { T_CityDistrict } from "~/models/cityNested";
import { allListingCategoryRent, getCategorySlug } from "~/models/enums";
import { BannerIntroRent } from "~/ui/BannerIntroRent";
import { CardListingCategory } from "~/ui/CardListingCategory";
import { CardListingDistrict } from "~/ui/CardListingDistrict";
import { SeoFaqSection } from "~/ui/PageMeta/SeoFaqSection";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { Title } from "~/ui/Title";

import { SearchListingsFiltersSection } from "../GlobalLayout/SearchListingsFiltersSection";

type T_SearchListingCityPage = {
  city: T_City;
  cityCategoryCounts?: T_CityCategoryCounts;
  district: null | T_CityDistrict;
  showDistrictsIfExists: boolean;
};

export const SearchListingCityPage = ({
  city,
  cityCategoryCounts,
  district,
  showDistrictsIfExists = true,
}: T_SearchListingCityPage) => {
  const { t } = useTranslation(namespaces.searchCity);
  const { t: tSearch } = useTranslation(namespaces.search);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();

  const linCity = getLocalizedRoute({
    extraPath: `/${city.nameSearch}`,
    route: E_Routes.cities,
  });

  const linkCurrent = getLocalizedRoute({
    extraPath: `/${city.nameSearch}/${district?.nameSearch}`,
    route: E_Routes.cities,
  });

  const totalListings = cityCategoryCounts?.total ?? 0;
  const companyName = tCommon("company.name");

  let title: string;
  let description: string;
  if (district) {
    title = tSeo("meta.searchCityDistrict.title", {
      city: city.name,
      companyName,
      district: district.name,
    });
    description = tSeo("meta.searchCityDistrict.description", {
      city: city.name,
      companyName,
      district: district.name,
    });
  } else if (totalListings > 0) {
    title = tSeo("meta.searchCityWithCount.title", {
      city: city.name,
      companyName,
      count: totalListings,
    });
    description = tSeo("meta.searchCityWithCount.description", {
      city: city.name,
      companyName,
      count: totalListings,
    });
  } else {
    title = tSeo("meta.searchCity.title", {
      city: city.name,
      companyName,
    });
    description = tSeo("meta.searchCity.description", {
      city: city.name,
      companyName,
    });
  }

  const seoFaqItems = useMemo(() => {
    if (district) {
      return [];
    }
    const interpolation = {
      city: city.name,
      count: totalListings,
      voivodeship: city.voivodeship,
    };
    return [
      {
        description: tSearch("cityFaq.q1.answer", interpolation),
        title: tSearch("cityFaq.q1.question", interpolation),
      },
      {
        description: tSearch("cityFaq.q2.answer", interpolation),
        title: tSearch("cityFaq.q2.question", interpolation),
      },
      {
        description: tSearch("cityFaq.q3.answer", interpolation),
        title: tSearch("cityFaq.q3.question", interpolation),
      },
      {
        description: tSearch("cityFaq.q4.answer", interpolation),
        title: tSearch("cityFaq.q4.question", interpolation),
      },
    ];
  }, [tSearch, district, city.name, city.voivodeship, totalListings]);

  const itemListJsonLd = useMemo(() => {
    if (district) {
      return;
    }
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: allListingCategoryRent.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${links.baseUrl}${getLocalizedRoute({
          extraPath: `/${getCategorySlug(category)}/${city.nameSearch}`,
          route: E_Routes.search,
        })}`,
      })),
      numberOfItems: allListingCategoryRent.length,
    };
  }, [district, city.nameSearch, getLocalizedRoute]);

  const countDistricts = (city?.districts ?? [])?.length;
  const showDistricts = countDistricts > 0 && showDistrictsIfExists;

  city?.districts?.sort((a, b) => {
    const firstItemToSort = a.name;
    const secondItemToSort = b.name;
    if (firstItemToSort && secondItemToSort) {
      if (firstItemToSort < secondItemToSort) {
        return -1;
      } else if (firstItemToSort > secondItemToSort) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  });

  allListingCategoryRent?.sort((a, b) => {
    const firstItemToSort = tCommon(`listingCategory.${a}`);
    const secondItemToSort = tCommon(`listingCategory.${b}`);
    if (firstItemToSort && secondItemToSort) {
      if (firstItemToSort < secondItemToSort) {
        return -1;
      } else if (firstItemToSort > secondItemToSort) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  });

  const mapDistricts = city?.districts?.map(item => {
    return (
      <CardListingDistrict
        city={city}
        district={item}
        key={`district_${item.id}`}
      />
    );
  });

  const mapCategories = allListingCategoryRent.map(item => {
    return (
      <CardListingCategory
        category={item}
        city={city}
        count={cityCategoryCounts?.byCategory?.[item]}
        district={district}
        key={`category_${item}`}
      />
    );
  });

  return (
    <>
      <SearchListingsFiltersSection
        breadcrumbs={
          district
            ? [
                E_Routes.home,
                E_Routes.cities,
                {
                  customHref: linCity,
                  customTitle: city.name,
                },
                {
                  customHref: linkCurrent,
                  customTitle: district.name,
                },
              ]
            : [
                E_Routes.home,
                E_Routes.cities,
                {
                  customHref: linCity,
                  customTitle: city.name,
                },
              ]
        }
        city={city}
        district={district}
        pageMeta={{
          customCanonical: linkCurrent,
          ...(itemListJsonLd ? { customJsonLd: [itemListJsonLd] } : {}),
          customDescription: description,
          customTitle: title,
          robotsNoIndex: cityCategoryCounts
            ? cityCategoryCounts.total === 0
            : false,
          route: E_Routes.search,
          ...(seoFaqItems.length > 0
            ? {
                seoFaq: {
                  faq: seoFaqItems,
                  hideInlineSection: true,
                  route: E_Routes.search,
                },
              }
            : {}),
          socials: {
            description,
            image: getCompanySeoImage({
              tCommon,
              tSeo,
            }),
            title,
            twitterCreator: links.twitter.creator,
            twitterSite: links.twitter.site,
            type: "website",
            url: `${links.baseUrl}${linkCurrent}`,
          },
        }}
      />
      <Section
        description={t("description")}
        title={showDistricts ? t("title") : t("titleCategory")}
        withPageMeta={false}
      >
        <Box pb={64} w="100%">
          <Flex align="flex-start" gap={12} justify="center" wrap="wrap">
            {mapCategories}
          </Flex>
        </Box>
      </Section>
      {showDistricts && (
        <Section
          description={t("descriptionDistrict")}
          title={t("titleDistrict")}
          withPageMeta={false}
        >
          <Box pb={64} w="100%">
            <Flex align="flex-start" gap={12} justify="center" wrap="wrap">
              {mapDistricts}
            </Flex>
          </Box>
        </Section>
      )}
      <Section
        backgroundSecondary
        size="lg"
        withBottomPadding={false}
        withPageMeta={false}
        withTopPadding={false}
      >
        <BannerIntroRent />
      </Section>
      {cityCategoryCounts && !district && (
        <Section size="lg" withPageMeta={false}>
          <Box pb={32} w="100%">
            <Title center order={2} size="h2">
              {totalListings > 0
                ? t("contentBlock.titleWithListings", {
                    city: city.name,
                    count: totalListings,
                  })
                : t("contentBlock.titleNoListings", {
                    city: city.name,
                  })}
            </Title>
            <Text center mt={16}>
              {totalListings > 0
                ? t("contentBlock.description", {
                    city: city.name,
                    count: totalListings,
                    voivodeship: city.voivodeship,
                  })
                : t("contentBlock.descriptionEmpty", {
                    city: city.name,
                    voivodeship: city.voivodeship,
                  })}
            </Text>
          </Box>
        </Section>
      )}
      {seoFaqItems.length > 0 && <SeoFaqSection items={seoFaqItems} />}
    </>
  );
};

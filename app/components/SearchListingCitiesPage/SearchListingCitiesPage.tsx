import { Box, Flex, Text, Title } from "@mantine/core";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { getCompanySeoImage } from "~/constants/seo";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { T_CategoryCityCounts } from "~/models/categoryCityCounts";
import { T_Cities } from "~/models/cities";
import { T_CityCounts } from "~/models/cityCounts";
import { getCategorySlug, T_ListingCategory } from "~/models/enums";
import { BannerIntroRent } from "~/ui/BannerIntroRent";
import { CardListingCity } from "~/ui/CardListingCity";
import { Input } from "~/ui/Input";
import { Section } from "~/ui/Section";
import { normalizeSearch } from "~/utilities/functions";

import { SearchListingsFiltersSection } from "../GlobalLayout/SearchListingsFiltersSection";

type T_SearchListingCitiesPage = {
  category?: null | T_ListingCategory;
  categoryCityCounts?: T_CategoryCityCounts;
  cities: T_Cities;
  cityCounts?: T_CityCounts;
};

export const SearchListingCitiesPage = ({
  category,
  categoryCityCounts,
  cities,
  cityCounts,
}: T_SearchListingCitiesPage) => {
  const [searchValue, setSearchValue] = useState("");

  const effectiveCounts = categoryCityCounts ?? cityCounts;

  const totalOffers = useMemo(() => {
    if (!effectiveCounts) {
      return 0;
    }
    return Object.values(effectiveCounts).reduce(
      (sum, count) => sum + count,
      0,
    );
  }, [effectiveCounts]);

  const { t } = useTranslation(namespaces.search);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();

  let title: string = tSeo(`meta.searchCities.title`, {
    companyName: tCommon("company.name"),
  });

  if (category) {
    title = tSeo(`meta.searchCategory.title`, {
      categoryPlural: tCommon(
        `listingCategoryPlural.${category?.toUpperCase() as T_ListingCategory}`,
      ),
      companyName: tCommon("company.name"),
    });
  }

  const linkCurrent = category
    ? getLocalizedRoute({
        extraPath: `/${getCategorySlug(category)}`,
        route: E_Routes.search,
      })
    : getLocalizedRoute({
        route: E_Routes.cities,
      });

  const handleChangeInput = useCallback((value: number | string) => {
    setSearchValue(value.toString());
  }, []);

  const sortedCities = useMemo(() => {
    return [...cities]
      .filter(item => item.nameSearch.includes(normalizeSearch(searchValue)))
      .sort((a, b) => {
        if (effectiveCounts) {
          const countA = effectiveCounts[a.id] ?? 0;
          const countB = effectiveCounts[b.id] ?? 0;
          if (countA !== countB) {
            return countB - countA;
          }
        }
        return a.name.localeCompare(b.name);
      });
  }, [searchValue, cities, effectiveCounts]);

  const mapCities = sortedCities.map(item => {
    return (
      <CardListingCity
        category={category}
        city={item}
        count={effectiveCounts?.[item.id]}
        key={`category_${item.id}`}
      />
    );
  });

  return (
    <>
      <SearchListingsFiltersSection
        breadcrumbs={
          category
            ? [
                E_Routes.home,
                E_Routes.search,
                {
                  customHref: linkCurrent,
                  customTitle: tCommon(
                    `listingCategoryPlural.${category?.toUpperCase() as T_ListingCategory}`,
                  ),
                },
              ]
            : [
                E_Routes.home,
                {
                  customHref: linkCurrent,
                  customTitle: tCommon("breadcrumbs.cities"),
                },
              ]
        }
        pageMeta={{
          customCanonical: linkCurrent,
          customDescription: category
            ? tSeo(`meta.searchCategory.description`, {
                categoryPlural: tCommon(
                  `listingCategoryPlural.${category?.toUpperCase() as T_ListingCategory}`,
                ),
              })
            : tSeo(`meta.searchCities.description`),
          customTitle: title,
          route: E_Routes.search,
          socials: {
            description: category
              ? tSeo(`meta.searchCategory.description`, {
                  categoryPlural: tCommon(
                    `listingCategoryPlural.${category?.toUpperCase() as T_ListingCategory}`,
                  ),
                })
              : tSeo(`meta.searchCities.description`),
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
        title={tCommon("search.title")}
        withPageMeta={false}
      >
        <Flex
          align="center"
          direction="column"
          justify="center"
          mt={12}
          w="100%"
        >
          <Box maw={420} w="100%">
            <Input
              clearable
              mb={48}
              onChange={handleChangeInput}
              placeholder={t("inputPlaceholder")}
              size="lg"
              w="100%"
            />
          </Box>
        </Flex>
        <Box pb={64} pt={32} w="100%">
          <Flex align="flex-start" gap={12} justify="center" wrap="wrap">
            {mapCities}
          </Flex>
        </Box>
      </Section>
      {category && categoryCityCounts && totalOffers > 0 && (
        <Section size="lg" withPageMeta={false}>
          <Box pb={32} w="100%">
            <Title order={2} size="h3">
              {t("categoryContent.titleWithListings", {
                categoryPlural: tCommon(
                  `listingCategoryPlural.${category?.toUpperCase() as T_ListingCategory}`,
                ),
                count: totalOffers,
              })}
            </Title>
            <Text mt={12}>
              {t("categoryContent.description", {
                categoryPlural: tCommon(
                  `listingCategoryPlural.${category?.toUpperCase() as T_ListingCategory}`,
                )?.toLowerCase(),
                cityCount: sortedCities.length,
                count: totalOffers,
              })}
            </Text>
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
    </>
  );
};

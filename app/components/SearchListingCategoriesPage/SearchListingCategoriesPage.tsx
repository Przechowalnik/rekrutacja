import { Box, Flex } from "@mantine/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { getCompanySeoImage } from "~/constants/seo";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { allListingCategory } from "~/models/enums";
import { CardListingCategory } from "~/ui/CardListingCategory";
import { Section } from "~/ui/Section";

import { SearchListingsFiltersSection } from "../GlobalLayout/SearchListingsFiltersSection";

export const SearchListingCategoriesPage = () => {
  const { t } = useTranslation(namespaces.search);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { getLocalizedRoute } = useLocalizedRoute();

  const sortedCategories = useMemo(() => {
    return [...allListingCategory].sort((a, b) => {
      const firstItemToSort = tCommon(`listingCategory.${a}`);
      const secondItemToSort = tCommon(`listingCategory.${b}`);

      return firstItemToSort.localeCompare(secondItemToSort);
    });
  }, []);

  const mapCategories = sortedCategories.map((item, index) => {
    return (
      <CardListingCategory
        category={item}
        city={null}
        district={null}
        key={`category_${index}`}
      />
    );
  });

  return (
    <>
      <SearchListingsFiltersSection
        breadcrumbs={[E_Routes.home, E_Routes.search]}
        pageMeta={{
          customCanonical: getLocalizedRoute({ route: E_Routes.search }),
          route: E_Routes.search,
          socials: {
            description: tSeo("meta.search.description"),
            image: getCompanySeoImage({ tCommon, tSeo }),
            title: tSeo("meta.search.title", {
              companyName: tCommon("company.name"),
            }),
            type: "website",
            url: `${links.baseUrl}${getLocalizedRoute({ route: E_Routes.search })}`,
          },
        }}
      />
      <Section
        description={t("description")}
        title={tCommon("search.title")}
        withPageMeta={false}
      >
        <Box pb={64} pt={32} w="100%">
          <Flex align="flex-start" gap={12} justify="center" wrap="wrap">
            {mapCategories}
          </Flex>
        </Box>
      </Section>
    </>
  );
};

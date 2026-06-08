import { Box, Flex } from "@mantine/core";
import throttle from "lodash/throttle";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, useSearchParams } from "react-router";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { globalClasses } from "~/constants/styles";
import {
  T_SearchListingLive,
  T_SearchListingProperties,
  T_SearchListingsCategoryAndFilters,
  T_SearchListingsExtraFilters,
  T_SearchListingsLocation,
} from "~/context/SearchListingsContext";
import { dynamic } from "~/hoc/dynamic";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSearchListings } from "~/hooks/useSearchListings";
import { T_City } from "~/models/city";
import { T_CityDistrict } from "~/models/cityNested";
import { allListingCategory } from "~/models/enums";
import { AutocompleteCity } from "~/ui/AutocompleteCity";
import { Bar } from "~/ui/Bar";
import { T_BreadcrumbsRoute } from "~/ui/Breadcrumbs";
import { Button } from "~/ui/Button";
import { Fieldset } from "~/ui/Fieldset";
import { IconSeo } from "~/ui/IconSeo";
import { Section } from "~/ui/Section";
import { T_SectionPageMeta } from "~/ui/Section/Section";
import { generateIconForListingCategory } from "~/utilities/listing";

const SearchListingsFiltersExtraFilters = dynamic(() =>
  import("./SearchListingsFiltersExtraFilters").then(module => ({
    default: module.SearchListingsFiltersExtraFilters,
  })),
);

type T_SearchListingsFiltersContent = {
  barExtraFiltersOpened: boolean;
  city?: T_City;
  district?: null | T_CityDistrict;
  handleClickBarExtraFilters: () => void;
  handleClickSearch: () => void;
  handleSaveNewCategoryAndFilters: (
    properties: T_SearchListingsCategoryAndFilters,
  ) => void;
  handleSaveNewExtraFilters: (properties: T_SearchListingsExtraFilters) => void;
  handleSaveNewLocation: (properties: T_SearchListingsLocation) => void;
  haveChangesInSearchToSave: boolean;
  searchListing: T_SearchListingProperties;
  searchListingLive: T_SearchListingLive | undefined;
};

export const FIELDSET_FONT_SIZE = "1rem";
export const FIELDSET_GAP = "12px 16px";

const SearchListingsFiltersContent = ({
  barExtraFiltersOpened,
  city,
  district,
  handleClickBarExtraFilters,
  handleClickSearch,
  handleSaveNewCategoryAndFilters,
  handleSaveNewExtraFilters,
  handleSaveNewLocation,
  haveChangesInSearchToSave,
  searchListing,
}: T_SearchListingsFiltersContent) => {
  const { t: tCommon } = useTranslation(namespaces.common);
  const { platformColor } = useLayout();

  const searchButtonTooltip = (() => {
    const hasCity = !!searchListing.location?.city;
    const hasCategory = !!searchListing.categoryAndFilters?.category;

    if (!haveChangesInSearchToSave || !hasCity || !hasCategory) {
      if (!hasCity && !hasCategory) {
        return { label: tCommon("navigation.header.tooltip") };
      }
      if (!hasCity) {
        return { label: tCommon("navigation.header.tooltipLocation") };
      }
      if (!hasCategory) {
        return { label: tCommon("navigation.header.tooltipCategory") };
      }
      return { label: tCommon("buttonNoChangesTooltip") };
    }

    return;
  })();

  const counterExtraFilters =
    (searchListing.location?.radius ? 1 : 0) +
    searchListing.extraFilters.workModes.length;

  const mapCategories = [...allListingCategory]
    .sort((a, b) =>
      tCommon(`listingCategory.${a}`).localeCompare(
        tCommon(`listingCategory.${b}`),
        "pl",
        { sensitivity: "base" },
      ),
    )
    .map(item => {
      const isActive = searchListing.categoryAndFilters.category === item;

      const generatedIcon = generateIconForListingCategory({
        listingCategory: item,
      });

      return (
        <Button
          bg={
            isActive
              ? platformColor
              : `light-dark(${colorsMantine.gray2}, ${colorsMantine.dark6})`
          }
          c={
            isActive
              ? colorsMantine.white
              : `light-dark(${colorsMantine.black}, ${colorsMantine.white})`
          }
          key={`category_${item}`}
          leftSection={<IconSeo icon={generatedIcon} size="lg" />}
          onClick={() => {
            handleSaveNewCategoryAndFilters({
              category: isActive ? null : item,
            });
          }}
          size="sm"
          variant="filled"
          w="auto"
        >
          {tCommon(`listingCategory.${item}`)}
        </Button>
      );
    });

  return (
    <Box
      pb={{
        base: 36,
        xs: 48,
      }}
    >
      <Flex
        align={{
          base: "flex-start",
          md: "stretch",
        }}
        direction={{
          base: "column",
          md: "row",
        }}
        gap={FIELDSET_GAP}
        pb={12}
      >
        <Box
          w={{
            base: "100%",
            md: "40%",
          }}
        >
          <Fieldset
            fontSize={FIELDSET_FONT_SIZE}
            fullHeight
            legend={tCommon("navigation.header.location")}
            withInputWrapper
            withRequired
          >
            <AutocompleteCity
              defaultValue={{
                city: city ?? null,
                district: district ?? null,
              }}
              direction="column"
              district={{
                disabled: !!searchListing?.location?.radius,
                tooltip: tCommon(
                  "selectListingCityDistrict.tooltipDistrictUnavailableWithRadius",
                ),
              }}
              onChange={newValue => {
                handleSaveNewLocation({
                  city: newValue.city,
                  district: newValue.district,
                  radius: null,
                });
              }}
              required
              withManagePageScroll={false}
            />
          </Fieldset>
        </Box>
        <Box
          w={{
            base: "100%",
            md: "60%",
          }}
        >
          <Fieldset
            description={tCommon("searchListingsFilters.categoryDescription")}
            fontSize={FIELDSET_FONT_SIZE}
            legend={tCommon("inputs.listingCategory")}
            withInputWrapper={false}
            withRequired
          >
            <Flex align="flex-start" gap={12} justify="flex-start" wrap="wrap">
              {mapCategories}
            </Flex>
          </Fieldset>
        </Box>
      </Flex>
      <Box pb={12} pt={12}>
        <Bar
          bg={colorsMantine.primaryLight}
          c={colorsMantine.primary}
          defaultOpened={false}
          label={`${tCommon("searchListingsFilters.buttonExtraFilters")}${counterExtraFilters ? ` (${counterExtraFilters})` : ""}`}
          onClick={handleClickBarExtraFilters}
          opened={barExtraFiltersOpened}
          py={4}
          size="lg"
          textCenter
        >
          <SearchListingsFiltersExtraFilters
            handleSaveNewExtraFilters={handleSaveNewExtraFilters}
            handleSaveNewLocation={handleSaveNewLocation}
            platformColor={platformColor}
            searchListing={searchListing}
          />
        </Bar>
      </Box>
      <Button
        className={
          haveChangesInSearchToSave &&
          searchListing?.location?.city &&
          searchListing?.categoryAndFilters?.category
            ? globalClasses.bounce
            : globalClasses.noAnimation
        }
        color="black"
        disabled={
          !haveChangesInSearchToSave ||
          !searchListing?.location?.city ||
          !searchListing?.categoryAndFilters?.category
        }
        fullWidth
        onClick={handleClickSearch}
        size="lg"
        tooltip={searchButtonTooltip}
        variant="filled"
      >
        {tCommon("searchListingsFilters.buttonSearch")}
      </Button>
    </Box>
  );
};

type T_SearchListingsFiltersSection = {
  breadcrumbs?: T_BreadcrumbsRoute[];
  city?: T_City;
  district?: null | T_CityDistrict;
  pageMeta?: T_SectionPageMeta;
  withScrollToResults?: boolean;
};

export const SearchListingsFiltersSection = ({
  breadcrumbs,
  city,
  district,
  pageMeta,
  withScrollToResults = true,
}: T_SearchListingsFiltersSection) => {
  const [barExtraFiltersOpened, setBarExtraFiltersOpened] = useState(false);
  const resultsReference = useRef<HTMLDivElement>(null);

  const { t: tCommon } = useTranslation(namespaces.common);
  const { isMobile } = useLayout();
  const [searchParameters] = useSearchParams();
  const parameters = useParams();
  const location = useLocation();
  const { getLocalizedRoute } = useLocalizedRoute();
  const {
    haveChangesInSearchToSave,
    initialUpdate,
    onChangeSearchListing,
    onClickSearchListings,
    searchListing,
    searchListingLive,
  } = useSearchListings();

  useEffect(() => {
    if (!withScrollToResults) {
      return;
    }

    const timeout = setTimeout(() => {
      if (resultsReference.current) {
        const top =
          resultsReference.current.getBoundingClientRect().top +
          window.scrollY -
          (isMobile ? 90 : 80);
        window.scrollTo({ behavior: "smooth", top });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.search]);

  const handleInitialData = useCallback(
    // eslint-disable-next-line react-hooks/use-memo
    throttle(
      async () => {
        if (
          location.pathname.includes(
            getLocalizedRoute({
              extraPath: "/",
              route: E_Routes.search,
            }),
          ) ||
          location.pathname.includes(
            getLocalizedRoute({
              extraPath: "/",
              route: E_Routes.cities,
            }),
          )
        ) {
          initialUpdate({
            newCity: city ?? null,
            parameters,
            searchParameters: new URLSearchParams(searchParameters),
          });
        } else {
          onChangeSearchListing({});
        }
      },
      500,
      { leading: true, trailing: false },
    ),
    [location.pathname, location.search, city],
  );

  useEffect(() => {
    handleInitialData();
  }, [location.pathname]);

  const handleClickBarExtraFilters = useCallback(() => {
    setBarExtraFiltersOpened(previousState => !previousState);
  }, []);

  const handleClickSearch = () => {
    setBarExtraFiltersOpened(false);
    window.scrollTo({
      behavior: "smooth",
      top: 0,
    });
    setTimeout(() => {
      onClickSearchListings();
    }, 350);
  };

  const handleSaveNewExtraFilters = useCallback(
    (newData: T_SearchListingsExtraFilters) => {
      onChangeSearchListing({
        extraFilters: newData,
      });
    },
    [],
  );

  const handleSaveNewCategoryAndFilters = useCallback(
    (newData: T_SearchListingsCategoryAndFilters) => {
      onChangeSearchListing({
        categoryAndFilters: newData,
      });
    },
    [],
  );

  const handleSaveNewLocation = useCallback(
    (newData: T_SearchListingsLocation) => {
      onChangeSearchListing({
        location: newData,
      });
    },
    [],
  );

  return (
    <Box pt={breadcrumbs ? undefined : 36}>
      <Section
        breadcrumbs={breadcrumbs}
        description={tCommon("searchListingsFilters.description")}
        pageMeta={pageMeta}
        size="lg"
        title={tCommon("searchListingsFilters.title")}
        withPaddingUnderTitle={false}
        withPageMeta={!!pageMeta}
        withTopPadding={!!breadcrumbs}
      >
        <SearchListingsFiltersContent
          barExtraFiltersOpened={barExtraFiltersOpened}
          city={city}
          district={district}
          handleClickBarExtraFilters={handleClickBarExtraFilters}
          handleClickSearch={handleClickSearch}
          handleSaveNewCategoryAndFilters={handleSaveNewCategoryAndFilters}
          handleSaveNewExtraFilters={handleSaveNewExtraFilters}
          handleSaveNewLocation={handleSaveNewLocation}
          haveChangesInSearchToSave={haveChangesInSearchToSave}
          searchListing={searchListing}
          searchListingLive={searchListingLive}
        />
      </Section>
      <div ref={resultsReference} />
    </Box>
  );
};

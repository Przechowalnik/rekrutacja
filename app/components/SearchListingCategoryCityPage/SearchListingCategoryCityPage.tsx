import { Box, Text, Title } from "@mantine/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import z from "zod";

import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { getCompanySeoImage } from "~/constants/seo";
import { useAxiosWithActions } from "~/hooks/useAxiosWithActions";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSearchListings } from "~/hooks/useSearchListings";
import { formNames } from "~/lib/zodFormValidator";
import { T_City } from "~/models/city";
import { T_CityCategoryCounts } from "~/models/cityCategoryCounts";
import { T_CityDistrict } from "~/models/cityNested";
import { getCategorySlug, T_ListingCategory } from "~/models/enums";
import { T_Listings, Z_Listings } from "~/models/listings";
import { T_ListingsMap, Z_ListingsMap } from "~/models/listingsMap";
import { Bar } from "~/ui/Bar";
import { ButtonMap } from "~/ui/ButtonMap";
import { CardSearchListing } from "~/ui/CardSearchListing";
import { CardSearchListingMap } from "~/ui/CardSearchListingMap";
import { InfiniteDataQueryPagination } from "~/ui/InfiniteDataQueryPagination";
import { Map, T_MapOnMoveEnd, T_Marker } from "~/ui/Map";
import { Modal } from "~/ui/Modal";
import { SeoFaqSection } from "~/ui/PageMeta/SeoFaqSection";
import { Section } from "~/ui/Section";
import { omitNested } from "~/utilities/functions";

import { SearchListingsFiltersSection } from "../GlobalLayout/SearchListingsFiltersSection";

type T_SearchListingCategoryCityPage = {
  city: T_City;
  cityCategoryCounts?: T_CityCategoryCounts;
  district: null | T_CityDistrict;
  listingCategory: T_ListingCategory;
  listings: T_Listings;
  nextPage: null | number;
  totalPages: null | number | undefined;
  totalResults: number;
};

export const SearchListingCategoryCityPage = ({
  city,
  cityCategoryCounts,
  district,
  listingCategory,
  listings,
  nextPage,
  totalPages,
  totalResults,
}: T_SearchListingCategoryCityPage) => {
  const [openedMobileMap, setOpenedMobileMap] = useState(false);
  const [currentMap, setCurrentMap] = useState<{
    listingsMap: T_ListingsMap;
    listingsMapCount: null | number;
  }>({
    listingsMap: [],
    listingsMapCount: null,
  });
  const lastMapBoundsReference = useRef<null | T_MapOnMoveEnd>(null);

  const { t } = useTranslation(namespaces.home);
  const { t: tSearch } = useTranslation(namespaces.search);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { searchListing, searchListingLive } = useSearchListings();
  const navigate = useNavigate();
  const [searchParameters] = useSearchParams();
  const pageNumber = Number(searchParameters.get("page") ?? "1");
  const isPaginatedBeyondFirst = Number.isFinite(pageNumber) && pageNumber > 1;
  const fetcherMap = useAxiosWithActions({
    disabledLoader: true,
    minimumLoadingTime: 0,
    schema: z.object({
      listingsMap: Z_ListingsMap,
      listingsMapCount: z.number(),
    }),
  });
  const { isMobile } = useLayout();
  const { getLocalizedRoute } = useLocalizedRoute();

  const linkCurrent = getLocalizedRoute({
    extraPath: `/${getCategorySlug(listingCategory)}/${city.nameSearch.toLowerCase()}${district ? `/${district.nameSearch?.toLowerCase()}` : ""}`,
    route: E_Routes.search,
  });

  const linkCategoryCity = getLocalizedRoute({
    extraPath: `/${getCategorySlug(listingCategory)}/${city.nameSearch.toLowerCase()}`,
    route: E_Routes.search,
  });

  const categoryPluralLower = tCommon(
    `listingCategoryPlural.${listingCategory}`,
  )?.toLowerCase();
  const companyName = tCommon("company.name");

  let title: string;
  let description: string;
  if (district) {
    title = tSeo("meta.searchCategoryCityDistrict.title", {
      categoryPlural: categoryPluralLower,
      city: city.name,
      companyName,
      district: district.name,
    });
    description = tSeo("meta.searchCategoryCityDistrict.description", {
      categoryPlural: categoryPluralLower,
      city: city.name,
      companyName,
      district: district.name,
    });
  } else if (totalResults > 0) {
    title = tSeo("meta.searchCategoryCityWithCount.title", {
      categoryPlural: categoryPluralLower,
      city: city.name,
      companyName,
      count: totalResults,
    });
    description = tSeo("meta.searchCategoryCityWithCount.description", {
      categoryPlural: categoryPluralLower,
      city: city.name,
      companyName,
      count: totalResults,
    });
  } else {
    title = tSeo("meta.searchCategoryCity.title", {
      categoryPlural: categoryPluralLower,
      city: city.name,
      companyName,
    });
    description = tSeo("meta.searchCategoryCity.description", {
      categoryPlural: categoryPluralLower,
      city: city.name,
      companyName,
    });
  }

  const itemListJsonLd = useMemo(() => {
    if (isPaginatedBeyondFirst || listings.length === 0) {
      return;
    }
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: listings.map((listing, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${links.baseUrl}${getLocalizedRoute({
          extraPath: `/${listing.slug ?? listing.id}`,
          route: E_Routes.listings,
        })}`,
      })),
      numberOfItems: listings.length,
    };
  }, [listings, isPaginatedBeyondFirst, getLocalizedRoute]);

  const seoFaqItems = useMemo(() => {
    if (district) {
      return [];
    }
    const interpolation = {
      categoryPlural: categoryPluralLower,
      city: city.name,
      count: totalResults,
    };
    return [
      {
        description: tSearch("categoryCityFaq.q1.answer", interpolation),
        title: tSearch("categoryCityFaq.q1.question", interpolation),
      },
      {
        description: tSearch("categoryCityFaq.q2.answer", interpolation),
        title: tSearch("categoryCityFaq.q2.question", interpolation),
      },
      {
        description: tSearch("categoryCityFaq.q3.answer", interpolation),
        title: tSearch("categoryCityFaq.q3.question", interpolation),
      },
      {
        description: tSearch("categoryCityFaq.q4.answer", interpolation),
        title: tSearch("categoryCityFaq.q4.question", interpolation),
      },
      {
        description: tSearch("categoryCityFaq.q5.answer", interpolation),
        title: tSearch("categoryCityFaq.q5.question", interpolation),
      },
    ];
  }, [tSearch, district, categoryPluralLower, city.name, totalResults]);

  useEffect(() => {
    if (fetcherMap?.data?.listingsMap) {
      setCurrentMap({
        listingsMap: fetcherMap.data.listingsMap,
        listingsMapCount: fetcherMap?.data?.listingsMapCount ?? 0,
      });
    }
  }, [fetcherMap.data]);

  const handleFetchMapData = useCallback(
    (boundsMapLocation: T_MapOnMoveEnd) => {
      if (isMobile && !openedMobileMap) {
        return;
      }

      lastMapBoundsReference.current = boundsMapLocation;

      fetcherMap.fetch({
        method: "GET",
        url: getLocalizedRoute({
          extraQuery: {
            ...searchListingLive,
            [formNames.isMobile]: isMobile.toString(),
            [formNames.mapLocationEast]: boundsMapLocation.east.toString(),
            [formNames.mapLocationNorth]: boundsMapLocation.north.toString(),
            [formNames.mapLocationSouth]: boundsMapLocation.south.toString(),
            [formNames.mapLocationWest]: boundsMapLocation.west.toString(),
            [formNames.mapZoom]: boundsMapLocation.zoom.toString(),
          },
          route: E_Routes.apiSearchMap,
        }),
      });
    },
    [searchListingLive, isMobile, openedMobileMap],
  );

  useEffect(() => {
    if (lastMapBoundsReference.current) {
      handleFetchMapData(lastMapBoundsReference.current);
    }
  }, [searchListingLive]);

  const handleOpenOpenedMobileMap = useCallback(() => {
    setOpenedMobileMap(true);
  }, []);

  const handleCloseOpenedMobileMap = useCallback(() => {
    setOpenedMobileMap(false);
  }, []);

  const mapMarkers: T_Marker[] = (currentMap?.listingsMap ?? [])
    ?.filter(item => !!item?.location?.lat && !!item?.location?.lng)
    ?.map(item => {
      return {
        content: <CardSearchListingMap listingMap={item} />,
        id: item.id,
        lat: item?.location?.lat ?? 0,
        link: getLocalizedRoute({
          extraPath: `/${item?.id}`,
          route: E_Routes.listings,
        }),
        lng: item?.location?.lng ?? 0,
        onClickDetails: () => {
          if (isMobile) {
            handleCloseOpenedMobileMap();
          }
          navigate(
            getLocalizedRoute({
              extraPath: `/${item?.id}`,
              route: E_Routes.listings,
            }),
          );
        },
        title: item.title,
      };
    });

  const selectedLocation = useMemo(() => {
    if (!searchListingLive?.listingCity) {
      return null;
    }

    if (searchListingLive.listingDistrict) {
      const foundDistrict = city.districts.find(
        item => item.nameSearch === searchListingLive.listingDistrict,
      );
      return foundDistrict;
    }

    return {
      lat: city.lat,
      lng: city.lng,
    };
  }, [searchListingLive]);

  const omitSearchListingLive = useMemo(
    () =>
      omitNested(searchListingLive, {
        listingCategory: false,
        listingCity: false,
      }),
    [searchListingLive],
  );

  const selectedMap = selectedLocation && (
    <Map
      center={selectedLocation}
      countMarkers={fetcherMap?.data?.listingsMapCount ?? 0}
      height={600}
      isLoading={fetcherMap.loading}
      markers={mapMarkers}
      onCloseMap={isMobile ? handleCloseOpenedMobileMap : undefined}
      onMoveEnd={handleFetchMapData}
    />
  );

  return (
    <>
      <SearchListingsFiltersSection
        breadcrumbs={
          district
            ? [
                E_Routes.home,
                E_Routes.search,
                {
                  customHref: getLocalizedRoute({
                    extraPath: `/${getCategorySlug(listingCategory)}`,
                    route: E_Routes.search,
                  }),
                  customTitle: tCommon(
                    `listingCategoryPlural.${listingCategory}`,
                  ),
                },
                {
                  customHref: linkCategoryCity,
                  customTitle: city.name,
                },
                {
                  customHref: linkCurrent,
                  customTitle: district.name,
                },
              ]
            : [
                E_Routes.home,
                E_Routes.search,
                {
                  customHref: getLocalizedRoute({
                    extraPath: `/${getCategorySlug(listingCategory)}`,
                    route: E_Routes.search,
                  }),
                  customTitle: tCommon(
                    `listingCategoryPlural.${listingCategory}`,
                  ),
                },
                {
                  customHref: linkCurrent,
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
          robotsNoIndex: totalResults === 0 || isPaginatedBeyondFirst,
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
        backgroundSecondary
        description={tCommon("search.description", {
          count: totalResults,
        })}
        title={tCommon("search.title", {
          totalResults,
        })}
        withBottomPadding={false}
        withPageMeta={false}
      >
        <Box pb={64} w="100%">
          <Box
            h={{
              base: "auto",
              sm: 600,
            }}
            visibleFrom="sm"
            w="100%"
          >
            {selectedMap}
          </Box>
          <Box hiddenFrom="sm">
            <Modal
              onClickOutside={handleCloseOpenedMobileMap}
              opened={openedMobileMap}
              size="xl"
              withFocusTrap={false}
              withWindowSize={false}
            >
              {selectedMap}
            </Modal>
            <ButtonMap
              location={selectedLocation}
              onClick={handleOpenOpenedMobileMap}
            />
          </Box>
        </Box>
      </Section>
      <Section withTopPadding={false}>
        <Box>
          <Box
            pb={32}
            pt={{
              base: 32,
              sm: 64,
            }}
          >
            <Bar
              label={`${tCommon(
                `listingCategoryPlural.${listingCategory ?? searchListing.categoryAndFilters.category}`,
              )}${typeof totalResults === "number" ? ` (${totalResults})` : ""}`}
            />
          </Box>
          <InfiniteDataQueryPagination
            data={{
              items: listings,
              nextPage: nextPage,
              totalPages: totalPages,
            }}
            extraQuery={omitSearchListingLive}
            gapData={12}
            limit={10}
            noMoreDataDescription={
              searchListingLive ? t("noData") : t("noDataToSearch")
            }
            renderItem={item => {
              return (
                <CardSearchListing
                  backgroundSecondary
                  key={`listing_${item.id}`}
                  listing={item}
                />
              );
            }}
            schema={Z_Listings}
          />
        </Box>
      </Section>
      {cityCategoryCounts && !district && (
        <Section backgroundSecondary size="lg" withPageMeta={false}>
          <Box pb={32} w="100%">
            <Title order={2} size="h3">
              {totalResults > 0
                ? tSearch("categoryCityContent.titleWithListings", {
                    categoryPlural: tCommon(
                      `listingCategoryPlural.${listingCategory}`,
                    ),
                    city: city.name,
                    count: totalResults,
                  })
                : tSearch("categoryCityContent.titleNoListings", {
                    categoryPlural: tCommon(
                      `listingCategoryPlural.${listingCategory}`,
                    ),
                    city: city.name,
                  })}
            </Title>
            <Text mt={12}>
              {totalResults > 0
                ? tSearch("categoryCityContent.description", {
                    categoryPlural: tCommon(
                      `listingCategoryPlural.${listingCategory}`,
                    )?.toLowerCase(),
                    city: city.name,
                    count: totalResults,
                    voivodeship: city.voivodeship,
                  })
                : tSearch("categoryCityContent.descriptionEmpty", {
                    categoryPlural: tCommon(
                      `listingCategoryPlural.${listingCategory}`,
                    )?.toLowerCase(),
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

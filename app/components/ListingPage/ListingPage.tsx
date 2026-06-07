import { faFlag } from "@fortawesome/free-regular-svg-icons";
import { faShare } from "@fortawesome/free-solid-svg-icons";
import { Box, Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { getCompanySeoImage } from "~/constants/seo";
import { dynamic } from "~/hoc/dynamic";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUserCookie } from "~/hooks/useUserCookie";
import { formNames } from "~/lib/zodFormValidator";
import {
  allLocationRadius,
  E_ListingCategory,
  E_ListingContractType,
  E_ListingType,
  getCategorySlug,
} from "~/models/enums";
import { T_Listing } from "~/models/listing";
import { AvatarListing } from "~/ui/AvatarListing";
import { Badge } from "~/ui/Badge";
import { Button } from "~/ui/Button";
import { ButtonMap } from "~/ui/ButtonMap";
import { CardSearchListingMap } from "~/ui/CardSearchListingMap";
import { IconSeo } from "~/ui/IconSeo";
import { Map } from "~/ui/Map";
import { Modal } from "~/ui/Modal";
import { Section } from "~/ui/Section";
import { SliderListingsImages } from "~/ui/SliderListingsImages";
import { Text } from "~/ui/Text";
import { Title } from "~/ui/Title";
import { Tooltip } from "~/ui/Tooltip";
import { hidePhoneNumbers } from "~/utilities/converter";
import {
  generateLocationAddress,
  normalizeSearch,
} from "~/utilities/functions";
import {
  formatAmountToNumber,
  generateListingPriceToShowFromTypeAndContractType,
} from "~/utilities/price";
import { trackViewContent } from "~/utilities/tracking";

const ModalReport = dynamic(() =>
  import("~/ui/ModalReport").then(module => ({
    default: module.ModalReport,
  })),
);

type T_ListingPage = {
  listing: T_Listing;
  metaCapiEventId?: string;
};

export const ListingPage = ({ listing, metaCapiEventId }: T_ListingPage) => {
  const [openedMobileMap, setOpenedMobileMap] = useState(false);
  const [openedModalReport, setOpenedModalReport] = useState(false);

  const firedReference = useRef(false);

  const { t } = useTranslation(namespaces.listing);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { getLocalizedRoute } = useLocalizedRoute();

  const { isMobile } = useLayout();
  const { userCookie } = useUserCookie();

  const fetcher = useFetcherWithActions({
    disabledLoader: true,
  });

  const validCitySearch =
    listing?.location?.nearestCity?.nameSearch ??
    listing?.location?.city?.nameSearch ??
    normalizeSearch(listing?.location?.cityCustom?.toLowerCase() ?? "");

  const validCitySearchName =
    listing?.location?.nearestCity?.name ??
    listing?.location?.city?.name ??
    listing?.location?.cityCustom ??
    "";

  const isSameCityNearest = listing?.location?.nearestCity
    ? listing?.location?.nearestCity?.nameSearch ===
      (listing?.location?.city?.nameSearch ??
        normalizeSearch(listing?.location?.cityCustom?.toLowerCase() ?? ""))
    : true;

  const linkCurrent = getLocalizedRoute({
    extraPath: `/${getCategorySlug(listing?.category)}/${validCitySearch}`,
    route: E_Routes.search,
    ...(isSameCityNearest
      ? {}
      : {
          extraQuery: {
            [formNames.locationRadius]: (
              allLocationRadius.at(-1) ?? ""
            )?.toString(),
          },
        }),
  });
  const validTitle = hidePhoneNumbers({
    replaceText: t("replacePhoneNumber"),
    text: listing.title,
  });

  const title = tSeo(`meta.listing.title`, {
    category: tCommon(`listingCategory.${listing.category}`)?.toLowerCase(),
    city: validCitySearchName,
    companyName: tCommon("company.name"),
  });

  const validDescription = hidePhoneNumbers({
    replaceText: t("replacePhoneNumber"),
    text: listing.description ?? "",
  });

  const primaryImageUrl =
    listing.images?.find(image => image.isDefault)?.url ??
    listing.images?.[0]?.url ??
    null;

  const seoListingImage = primaryImageUrl
    ? {
        alt: validTitle,
        height: "630",
        type: "image/jpeg" as const,
        url: primaryImageUrl,
        width: "1200",
      }
    : getCompanySeoImage({ tCommon, tSeo });

  const fullListingUrl = `${links.baseUrl}${getLocalizedRoute({
    extraPath: `/${listing.slug ?? listing.id}`,
    route: E_Routes.listings,
  })}`;

  const priceNumber = formatAmountToNumber(listing.price ?? 0);
  const street =
    [listing.location?.streetName, listing.location?.streetNumber]
      .filter(Boolean)
      .join(" ") || undefined;

  const itemConditionMap: Record<string, string> = {
    FINISHED: "https://schema.org/UsedCondition",
    NEEDS_RENOVATION: "https://schema.org/UsedCondition",
    NEW: "https://schema.org/NewCondition",
    PARTIALLY_FINISHED: "https://schema.org/UsedCondition",
    RAW: "https://schema.org/UsedCondition",
  };
  const itemCondition = listing.condition
    ? itemConditionMap[listing.condition]
    : undefined;

  const isRent = listing.type === E_ListingType.RENT;
  const unitCode = isRent
    ? listing.contractType === E_ListingContractType.SHORT_TERM
      ? "DAY"
      : "MON"
    : undefined;

  const offerPriceSpecification = unitCode
    ? {
        "@type": "UnitPriceSpecification",
        price: priceNumber,
        priceCurrency: "PLN",
        referenceQuantity: {
          "@type": "QuantitativeValue",
          unitCode,
          value: 1,
        },
      }
    : undefined;

  const additionalProperties: Array<Record<string, unknown>> = [];
  if (typeof listing.area === "number" && listing.area > 0) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "area",
      unitCode: "MTK",
      unitText: "m²",
      value: listing.area,
    });
  }
  if (listing.floorLevel != null) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "floorLevel",
      value: listing.floorLevel,
    });
  }

  const customJsonLd: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      ...(additionalProperties.length > 0
        ? { additionalProperty: additionalProperties }
        : {}),
      ...(listing.images && listing.images.length > 0
        ? {
            image: listing.images
              .map(image => image.url)
              .filter((url): url is string => typeof url === "string"),
          }
        : {}),
      category: tCommon(`listingCategory.${listing.category}`),
      description: validDescription || validTitle,
      ...(itemCondition ? { itemCondition } : {}),
      name: validTitle,
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        ...(itemCondition ? { itemCondition } : {}),
        price: priceNumber,
        priceCurrency: "PLN",
        ...(offerPriceSpecification
          ? { priceSpecification: offerPriceSpecification }
          : {}),
        ...(listing.expiresAt
          ? {
              priceValidUntil: dayjs(listing.expiresAt).format("YYYY-MM-DD"),
            }
          : {}),
        url: fullListingUrl,
        ...(listing.availableFrom
          ? { validFrom: dayjs(listing.availableFrom).toISOString() }
          : {}),
        ...(listing.availableTo
          ? { validThrough: dayjs(listing.availableTo).toISOString() }
          : {}),
      },
      url: fullListingUrl,
    },
  ];

  if (listing.location?.lat && listing.location?.lng) {
    customJsonLd.push({
      "@context": "https://schema.org",
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "PL",
        ...(validCitySearchName
          ? { addressLocality: validCitySearchName }
          : {}),
        ...(listing.location?.postalCode
          ? { postalCode: listing.location.postalCode }
          : {}),
        ...(street ? { streetAddress: street } : {}),
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: listing.location.lat,
        longitude: listing.location.lng,
      },
      name: validTitle,
    });
  }

  const realEstateAddress = {
    "@type": "PostalAddress",
    addressCountry: "PL",
    ...(validCitySearchName ? { addressLocality: validCitySearchName } : {}),
    ...(listing.location?.postalCode
      ? { postalCode: listing.location.postalCode }
      : {}),
    ...(street ? { streetAddress: street } : {}),
  };

  customJsonLd.push({
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    ...(additionalProperties.length > 0
      ? { additionalProperty: additionalProperties }
      : {}),
    address: realEstateAddress,
    datePosted: listing.createdAt
      ? dayjs(listing.createdAt).toISOString()
      : undefined,
    description: validDescription || validTitle,
    ...(listing.images && listing.images.length > 0
      ? {
          image: listing.images
            .map(image => image.url)
            .filter((url): url is string => typeof url === "string"),
        }
      : {}),
    ...(typeof listing.area === "number" && listing.area > 0
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            unitCode: "MTK",
            value: listing.area,
          },
        }
      : {}),
    ...(listing.expiresAt
      ? { leaseLength: dayjs(listing.expiresAt).format("YYYY-MM-DD") }
      : {}),
    name: validTitle,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: priceNumber,
      priceCurrency: "PLN",
      ...(offerPriceSpecification
        ? { priceSpecification: offerPriceSpecification }
        : {}),
      url: fullListingUrl,
    },
    url: fullListingUrl,
  });

  useEffect(() => {
    if (firedReference.current || userCookie?.userId === listing?.user?.id) {
      return;
    }
    firedReference.current = true;

    fetcher.submit(
      {},
      {
        action: getLocalizedRoute({
          extraPath: `/${listing.slug ?? listing.id}`,
          route: E_Routes.listings,
        }),
        method: "post",
      },
    );
  }, [listing]);

  useEffect(() => {
    if (!metaCapiEventId) {
      return;
    }
    const contentId = listing.slug ?? listing.id;
    if (!contentId) {
      return;
    }

    trackViewContent({
      contentCategory: listing.category,
      contentIds: [contentId],
      contentName: validTitle,
      currency: "PLN",
      eventId: metaCapiEventId,
      ...(priceNumber > 0 ? { value: priceNumber } : {}),
    });
  }, [metaCapiEventId, listing.id]);

  const handleOpenedModalReport = useCallback(() => {
    setOpenedModalReport(previousState => !previousState);
  }, []);

  const handleCopyCompanySocial = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          text: t("share.text"),
          title: `${validTitle} - ${generateListingPriceToShowFromTypeAndContractType(
            {
              contractType: listing.contractType,
              negotiable: listing.negotiable,
              price: listing.price,
              tCommon,
              type: listing.type,
            },
          )}`,
          url: `${globalThis.location.origin}${getLocalizedRoute({
            extraPath: `/${listing.slug ?? listing.id}`,
            route: E_Routes.listings,
          })}`,
        });
        return;
      }

      await navigator.clipboard.writeText(
        `${globalThis.location.origin}${getLocalizedRoute({
          extraPath: `/${listing.slug ?? listing.id}`,
          route: E_Routes.listings,
        })}`,
      );

      notifications.show({
        color: "green",
        message: tNotifications(`successCopyUrl.message`),
        title: tNotifications(`successCopyUrl.title`),
      });

      return;
    } catch {
      return;
    }
  }, [listing]);

  const handleOpenOpenedMobileMap = useCallback(() => {
    setOpenedMobileMap(true);
  }, []);

  const handleCloseOpenedMobileMap = useCallback(() => {
    setOpenedMobileMap(false);
  }, []);

  const mapSecurityOptions = listing?.securityOptions?.map(item => {
    return (
      <Badge key={`securityOption_${item}`}>
        {tCommon(`listingSecurityOption.${item}`)}
      </Badge>
    );
  });

  const mapComfortOptions = listing?.comfortOptions?.map(item => {
    return (
      <Badge key={`comfortOption_${item}`}>
        {tCommon(`listingComfortOption.${item}`)}
      </Badge>
    );
  });

  const mapUtilityOptions = listing?.utilityOptions?.map(item => {
    return (
      <Badge key={`utilityOption_${item}`}>
        {tCommon(`listingUtilityOption.${item}`)}
      </Badge>
    );
  });

  const mapUsageOptions = listing?.usageOptions?.map(item => {
    return (
      <Badge key={`usageOption_${item}`}>
        {tCommon(`listingUsageOptions.${item}`)}
      </Badge>
    );
  });

  const selectedMap = listing?.location && (
    <Map
      center={{
        lat: listing.location.lat,
        lng: listing.location.lng,
      }}
      countMarkers={1}
      height={isMobile ? 600 : 500}
      markers={[
        {
          content: <CardSearchListingMap listingMap={listing} showOnlyImage />,
          id: listing.id,
          lat: listing?.location?.lat ?? 0,
          lng: listing?.location?.lng ?? 0,
          onClickDetails: () => {},
          title: listing.title,
        },
      ]}
      onCloseMap={isMobile ? handleCloseOpenedMobileMap : undefined}
      withButtonsPreviousAndNext={false}
    />
  );

  const contentTitle = (
    <Flex
      align="flex-start"
      direction={{
        base: "column",
        xs: "row",
      }}
      gap={16}
      justify="space-between"
    >
      <Box>
        <Title>{validTitle}</Title>
        <Flex direction="column" gap={8} pt={12}>
          {listing?.area && (
            <Badge size="lg" variant="dot">
              {tCommon("cardSearchListing.area", {
                count: Number(listing.area),
              })}
            </Badge>
          )}
          {listing?.price && (
            <Badge color="teal" size="lg">
              {generateListingPriceToShowFromTypeAndContractType({
                contractType: listing.contractType,
                negotiable: listing.negotiable,
                price: listing.price,
                tCommon,
                type: listing.type,
              })}
            </Badge>
          )}
        </Flex>
      </Box>
      <Flex
        direction={{
          base: "row",
          xs: "column",
        }}
        gap={4}
        justify={{
          base: "center",
          xs: "flex-start",
        }}
        w={{
          base: "100%",
          xs: "auto",
        }}
      >
        {/* <Button
                color="dark"
                h={50}
                p={0}
                size="sm"
                variant="transparent"
                w={50}
              >
                <IconSeo icon={faHeart} size="2x" variant="regular" />
              </Button> */}
        <Tooltip label={t("tooltipSearch")} position="left" w={50}>
          <Button
            ariaLabel={tSeo("imagesAlt.iconShare")}
            color="dark"
            h={50}
            onClick={handleCopyCompanySocial}
            p={0}
            size="sm"
            variant="transparent"
            w={50}
          >
            <IconSeo icon={faShare} size="2x" />
          </Button>
        </Tooltip>
        <Button
          ariaLabel={tSeo("imagesAlt.iconShare")}
          color="red"
          disabled={!userCookie}
          h={50}
          onClick={handleOpenedModalReport}
          p={0}
          size="sm"
          tooltip={{
            label: userCookie
              ? t("tooltipReport")
              : tCommon("buttonRequiredUserSession"),
            position: userCookie ? "left" : undefined,
          }}
          tooltipOnlyOnDisabled={!userCookie}
          variant="transparent"
          w={50}
        >
          <IconSeo icon={faFlag} size="2x" />
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <>
      <ModalReport
        listingId={listing.id}
        onClose={handleOpenedModalReport}
        opened={openedModalReport}
      />
      <Section
        breadcrumbs={[
          E_Routes.home,
          E_Routes.search,
          {
            customHref: getLocalizedRoute({
              extraPath: `/${getCategorySlug(listing?.category)}`,
              route: E_Routes.search,
              ...(isSameCityNearest
                ? {}
                : {
                    extraQuery: {
                      [formNames.locationRadius]: (
                        allLocationRadius.at(-1) ?? ""
                      )?.toString(),
                    },
                  }),
            }),
            customTitle: listing?.category
              ? tCommon(`listingCategoryPlural.${listing.category}`)
              : "",
          },
          {
            customHref: linkCurrent,
            customTitle: validCitySearchName,
          },
          {
            customHref: getLocalizedRoute({
              extraPath: `/${listing.slug}`,
              route: E_Routes.listings,
            }),
            customTitle: t("title"),
          },
        ]}
        pageMeta={{
          customDescription: validDescription,
          customJsonLd,
          customTitle: title,
          route: E_Routes.search,
          socials: {
            description: validDescription,
            image: seoListingImage,
            title,
            twitterCreator: links.twitter.creator,
            twitterSite: links.twitter.site,
            type: "product",
            updatedTime: listing.updatedAt.toString(),
            url: fullListingUrl,
          },
        }}
        withOverflowHidden={false}
      >
        <Flex
          align="flex-start"
          direction={{
            base: "column",
            sm: "row",
          }}
          gap={24}
          justify="flex-start"
        >
          <Flex
            direction="column"
            justify="flex-end"
            w={{
              base: "100%",
              sm: "calc(55% - 16px)",
            }}
          >
            <SliderListingsImages
              altPrefix={validTitle}
              images={listing.images}
            />
            <Box hiddenFrom="sm" pt={32}>
              {contentTitle}
            </Box>
            <Text
              pt={{
                base: 0,
                sm: 64,
              }}
              size="md"
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              withHTML
            >
              {validDescription}
            </Text>
          </Flex>
          <Box
            w={{
              base: "100%",
              sm: "calc(45% - 16px)",
            }}
          >
            <Box pb={32} visibleFrom="sm">
              {contentTitle}
            </Box>
            <Flex
              direction="column"
              gap={12}
              pb={{
                base: 32,
                sm: 0,
              }}
            >
              <Box>
                <Text fw="bold" pb={4} size="lg">
                  {tCommon("inputs.listingCategory")}
                </Text>
                <Flex
                  align="flex-start"
                  gap={8}
                  justify="flex-start"
                  wrap="wrap"
                >
                  <Badge>
                    {tCommon(`listingCategory.${listing.category}`)}
                  </Badge>
                </Flex>
              </Box>
              {listing.category === E_ListingCategory.PARKING &&
                listing?.parkingType && (
                  <Box>
                    <Text fw="bold" pb={4} size="lg">
                      {tCommon("inputs.listingParkingType")}
                    </Text>
                    <Flex
                      align="flex-start"
                      gap={8}
                      justify="flex-start"
                      wrap="wrap"
                    >
                      <Badge>
                        {tCommon(`listingParkingType.${listing.parkingType}`)}
                      </Badge>
                    </Flex>
                  </Box>
                )}
              {listing.category === E_ListingCategory.CONTAINER &&
                listing?.containerType && (
                  <Box>
                    <Text fw="bold" pb={4} size="lg">
                      {tCommon("inputs.listingContainerType")}
                    </Text>
                    <Flex
                      align="flex-start"
                      gap={8}
                      justify="flex-start"
                      wrap="wrap"
                    >
                      <Badge>
                        {tCommon(
                          `listingContainerType.${listing.containerType}`,
                        )}
                      </Badge>
                    </Flex>
                  </Box>
                )}
              {listing.category === E_ListingCategory.UNIT &&
                listing?.unitType && (
                  <Box>
                    <Text fw="bold" pb={4} size="lg">
                      {tCommon("inputs.listingUnitType")}
                    </Text>
                    <Flex
                      align="flex-start"
                      gap={8}
                      justify="flex-start"
                      wrap="wrap"
                    >
                      <Badge>
                        {tCommon(`listingUnitType.${listing.unitType}`)}
                      </Badge>
                    </Flex>
                  </Box>
                )}
              {listing.category === E_ListingCategory.PLOT &&
                listing?.plotType && (
                  <Box>
                    <Text fw="bold" pb={4} size="lg">
                      {tCommon("inputs.listingPlotType")}
                    </Text>
                    <Flex
                      align="flex-start"
                      gap={8}
                      justify="flex-start"
                      wrap="wrap"
                    >
                      <Badge>
                        {tCommon(`listingPlotType.${listing.plotType}`)}
                      </Badge>
                    </Flex>
                  </Box>
                )}
              <Box>
                <Text fw="bold" pb={4} size="lg">
                  {tCommon("inputs.listingType")}
                </Text>
                <Flex
                  align="flex-start"
                  gap={8}
                  justify="flex-start"
                  wrap="wrap"
                >
                  <Badge>{tCommon(`listingType.${listing.type}`)}</Badge>
                </Flex>
              </Box>
              {listing.contractType && listing.type === E_ListingType.RENT && (
                <Box>
                  <Text fw="bold" pb={4} size="lg">
                    {tCommon("inputs.listingContractType")}
                  </Text>
                  <Flex
                    align="flex-start"
                    gap={8}
                    justify="flex-start"
                    wrap="wrap"
                  >
                    <Badge>
                      {tCommon(`listingContractType.${listing.contractType}`)}
                    </Badge>
                  </Flex>
                </Box>
              )}
              {listing.contractType === E_ListingContractType.SHORT_TERM && (
                <Box>
                  <Text fw="bold" pb={4} size="lg">
                    {tCommon("inputs.listingMinimumRentalDays")}
                  </Text>
                  <Flex
                    align="flex-start"
                    gap={8}
                    justify="flex-start"
                    wrap="wrap"
                  >
                    <Badge>{listing.minimumRentalDays}</Badge>
                  </Flex>
                </Box>
              )}
              {listing?.condition && (
                <Box>
                  <Text fw="bold" pb={4} size="lg">
                    {tCommon("inputs.listingCondition")}
                  </Text>
                  <Flex
                    align="flex-start"
                    gap={8}
                    justify="flex-start"
                    wrap="wrap"
                  >
                    <Badge>
                      {tCommon(`listingCondition.${listing.condition}`)}
                    </Badge>
                  </Flex>
                </Box>
              )}
              {listing?.access && (
                <Box>
                  <Text fw="bold" pb={4} size="lg">
                    {tCommon("inputs.listingAccess")}
                  </Text>
                  <Flex
                    align="flex-start"
                    gap={8}
                    justify="flex-start"
                    wrap="wrap"
                  >
                    <Badge>{tCommon(`listingAccess.${listing.access}`)}</Badge>
                  </Flex>
                </Box>
              )}
              {(listing?.securityOptions ?? [])?.length > 0 && (
                <Box>
                  <Text fw="bold" pb={4} size="lg">
                    {tCommon("inputs.listingSecurityOption")}
                  </Text>
                  <Flex
                    align="flex-start"
                    gap={8}
                    justify="flex-start"
                    wrap="wrap"
                  >
                    {mapSecurityOptions}
                  </Flex>
                </Box>
              )}
              {(listing?.utilityOptions ?? [])?.length > 0 && (
                <Box>
                  <Text fw="bold" pb={4} size="lg">
                    {tCommon("inputs.listingUtilityOption")}
                  </Text>
                  <Flex
                    align="flex-start"
                    gap={8}
                    justify="flex-start"
                    wrap="wrap"
                  >
                    {mapUtilityOptions}
                  </Flex>
                </Box>
              )}
              {(listing?.comfortOptions ?? [])?.length > 0 && (
                <Box>
                  <Text fw="bold" pb={4} size="lg">
                    {tCommon("inputs.listingComfortOption")}
                  </Text>
                  <Flex
                    align="flex-start"
                    gap={8}
                    justify="flex-start"
                    wrap="wrap"
                  >
                    {mapComfortOptions}
                  </Flex>
                </Box>
              )}
              {(listing?.usageOptions ?? [])?.length > 0 && (
                <Box>
                  <Text fw="bold" pb={4} size="lg">
                    {tCommon("inputs.listingUsageOption")}
                  </Text>
                  <Flex
                    align="flex-start"
                    gap={8}
                    justify="flex-start"
                    wrap="wrap"
                  >
                    {mapUsageOptions}
                  </Flex>
                </Box>
              )}
            </Flex>
          </Box>
        </Flex>
        <Box
          pb={42}
          pt={{
            base: 24,
            sm: 48,
          }}
        >
          <AvatarListing listing={listing} />
        </Box>
      </Section>
      <Section
        backgroundSecondary
        description={
          listing?.location?.lat && !!listing?.location?.lng
            ? generateLocationAddress({
                city: listing.location.city ?? null,
                cityCustom: listing.location.cityCustom ?? null,
                district: listing.location.district ?? null,
                flatNumber: listing.location.flatNumber,
                streetName: listing.location.streetName,
                streetNumber: listing.location.streetNumber,
              })
            : undefined
        }
        title={t("location")}
        titleOrder={2}
      >
        <Flex align="flex-start" gap={24} justify="flex-start" wrap="wrap">
          {listing?.location?.lat && !!listing?.location?.lng && (
            <Flex direction="column" w="100%">
              <Box
                h={{
                  base: "auto",
                  sm: 500,
                }}
                mb={24}
                visibleFrom="xs"
                w="100%"
              >
                {selectedMap}
              </Box>
              <Box hiddenFrom="xs" pb={40}>
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
                  location={listing?.location}
                  onClick={handleOpenOpenedMobileMap}
                />
              </Box>
            </Flex>
          )}
        </Flex>
      </Section>
    </>
  );
};

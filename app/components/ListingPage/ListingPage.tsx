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
  E_ListingStatus,
  E_WorkMode,
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
import { generateSalaryRange } from "~/utilities/price";

const ModalReport = dynamic(() =>
  import("~/ui/ModalReport").then(module => ({
    default: module.ModalReport,
  })),
);

type T_ListingPage = {
  listing: T_Listing;
};

export const ListingPage = ({ listing }: T_ListingPage) => {
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

  const isArchived =
    listing.status !== E_ListingStatus.ACTIVE ||
    (listing.expiresAt ? dayjs(listing.expiresAt).isBefore(dayjs()) : false);

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

  const street =
    [listing.location?.streetName, listing.location?.streetNumber]
      .filter(Boolean)
      .join(" ") || undefined;

  const jobAddress = {
    "@type": "PostalAddress",
    addressCountry: "PL",
    ...(validCitySearchName ? { addressLocality: validCitySearchName } : {}),
    ...(listing.location?.postalCode
      ? { postalCode: listing.location.postalCode }
      : {}),
    ...(street ? { streetAddress: street } : {}),
  };

  const customJsonLd: Array<Record<string, unknown>> = [
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      ...(listing.salaryFrom != null || listing.salaryTo != null
        ? {
            baseSalary: {
              "@type": "MonetaryAmount",
              currency: "PLN",
              value: {
                "@type": "QuantitativeValue",
                ...(listing.salaryFrom == null
                  ? {}
                  : { minValue: listing.salaryFrom }),
                ...(listing.salaryTo == null
                  ? {}
                  : { maxValue: listing.salaryTo }),
                unitText: "MONTH",
              },
            },
          }
        : {}),
      datePosted: listing.createdAt
        ? dayjs(listing.createdAt).toISOString()
        : undefined,
      description: validDescription || validTitle,
      hiringOrganization: {
        "@type": "Organization",
        name: listing.company?.name ?? tCommon("company.name"),
      },
      industry: tCommon(`listingCategory.${listing.category}`),
      jobLocation: {
        "@type": "Place",
        address: jobAddress,
        ...(listing.location?.lat && listing.location?.lng
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: listing.location.lat,
                longitude: listing.location.lng,
              },
            }
          : {}),
      },
      ...(listing.workMode === E_WorkMode.REMOTE
        ? { jobLocationType: "TELECOMMUTE" }
        : {}),
      title: validTitle,
      url: fullListingUrl,
      ...(listing.expiresAt
        ? { validThrough: dayjs(listing.expiresAt).toISOString() }
        : {}),
    },
  ];

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

  const handleOpenedModalReport = useCallback(() => {
    setOpenedModalReport(previousState => !previousState);
  }, []);

  const handleCopyCompanySocial = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          text: t("share.text"),
          title: validTitle,
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
          <Badge size="lg" variant="dot">
            {tCommon(`workMode.${listing.workMode}`)}
          </Badge>
          {(listing?.salaryFrom != null || listing?.salaryTo != null) && (
            <Badge color="teal" size="lg">
              {generateSalaryRange({
                salaryFrom: listing.salaryFrom,
                salaryTo: listing.salaryTo,
                tCommon,
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
      {isArchived && (
        <Box bg="red.7" px={16} py={10} style={{ textAlign: "center" }} w="100%">
          <Text c="white" fw={700} size="sm">
            {tCommon("listingArchivedNotice")}
            {listing.expiresAt
              ? ` ${tCommon("listingArchivedExpiredAt", {
                  date: dayjs(listing.expiresAt).format("DD.MM.YYYY"),
                })}`
              : ""}
          </Text>
        </Box>
      )}
      <Section
        breadcrumbs={
          isArchived
            ? [
                E_Routes.home,
                E_Routes.archive,
                {
                  customHref: getLocalizedRoute({
                    extraPath: `/${listing.slug}`,
                    route: E_Routes.listings,
                  }),
                  customTitle: t("title"),
                },
              ]
            : [
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
              ]
        }
        pageMeta={{
          customDescription: validDescription,
          customJsonLd,
          customTitle: title,
          route: E_Routes.search,
          socials: {
            description: validDescription,
            image: seoListingImage,
            title,
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
              <Box>
                <Text fw="bold" pb={4} size="lg">
                  {tCommon("inputs.listingWorkMode")}
                </Text>
                <Flex
                  align="flex-start"
                  gap={8}
                  justify="flex-start"
                  wrap="wrap"
                >
                  <Badge>{tCommon(`workMode.${listing.workMode}`)}</Badge>
                </Flex>
              </Box>
              {(listing?.salaryFrom != null || listing?.salaryTo != null) && (
                <Box>
                  <Text fw="bold" pb={4} size="lg">
                    {tCommon("inputs.listingSalary")}
                  </Text>
                  <Flex
                    align="flex-start"
                    gap={8}
                    justify="flex-start"
                    wrap="wrap"
                  >
                    <Badge color="teal">
                      {generateSalaryRange({
                        salaryFrom: listing.salaryFrom,
                        salaryTo: listing.salaryTo,
                        tCommon,
                      })}
                    </Badge>
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

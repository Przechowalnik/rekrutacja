import { faChevronRight, faImage } from "@fortawesome/free-solid-svg-icons";
import { AspectRatio, Box, Flex } from "@mantine/core";
import dayjs from "dayjs";
import type { MouseEvent } from "react";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { T_Listings } from "~/models/listings";
import { Image } from "~/ui/Image";
import { replaceDateToYearMonthDay } from "~/utilities/date";
import { generateLocationAddress } from "~/utilities/functions";
import { generateSalaryRange } from "~/utilities/price";

import { IconSeo } from "../IconSeo";
import { Text } from "../Text";

type T_CardSearchListingSmall = {
  listing: T_Listings[number];
};

const CardSearchListingSmallToMemoize = ({
  listing,
}: T_CardSearchListingSmall) => {
  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { getLocalizedRoute } = useLocalizedRoute();
  const { platformColor } = useLayout();
  const navigate = useNavigate();

  const firstImage =
    listing.images?.find(img => img.isDefault)?.url ||
    listing.images?.at(0)?.url;

  const handleGoToListing = useCallback(() => {
    navigate(
      getLocalizedRoute({
        extraPath: `/${listing.slug ?? listing.id}`,
        route: E_Routes.listings,
      }),
    );
  }, [listing, navigate]);

  const handleGoToListingNewPage = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.button === 1) {
        event.preventDefault();
        window.open(
          getLocalizedRoute({
            extraPath: `/${listing.slug ?? listing.id}`,
            route: E_Routes.listings,
          }),
          "_blank",
          "noopener",
        );
      }
    },
    [listing],
  );

  return (
    <Flex
      align="flex-end"
      h={262}
      justify="flex-start"
      pos="relative"
      style={{
        borderRadius: 20,
        overflow: "hidden",
      }}
      w={256}
    >
      <Flex
        align="center"
        bg="black"
        component="button"
        gap={8}
        h={70}
        justify="flex-start"
        onClick={handleGoToListing}
        onMouseDown={handleGoToListingNewPage}
        pos="relative"
        px={12}
        py={8}
        style={{
          border: 0,
          cursor: "pointer",
          textAlign: "left",
          zIndex: 1,
        }}
        type="button"
        w="100%"
      >
        <Box w="calc(100% - 20px)">
          <Text
            c="white"
            fw="bold"
            lineClamp={1}
            size="md"
            style={{
              userSelect: "none",
            }}
          >
            {`${listing.title},`}
          </Text>
          {listing.location && (
            <Text
              c="white"
              fw="bold"
              lineClamp={1}
              size="sm"
              style={{
                userSelect: "none",
              }}
            >
              {generateLocationAddress({
                city: listing.location.city ?? null,
                cityCustom: listing.location.cityCustom ?? null,
                district: listing.location.district ?? null,
                flatNumber: listing.location.flatNumber,
                streetName: listing.location.streetName,
                streetNumber: listing.location.streetNumber,
              })}
            </Text>
          )}
        </Box>
        <Box w={20}>
          <IconSeo
            color={colorsMantine.white}
            icon={faChevronRight}
            size="lg"
          />
        </Box>
      </Flex>
      <AspectRatio
        bottom={0}
        left={0}
        pos="absolute"
        ratio={4 / 3}
        right={0}
        top={0}
      >
        <Box pos="relative">
          {firstImage ? (
            <Image
              alt={tSeo("imagesAlt.imageListing")}
              customSrc={firstImage}
              fit="cover"
              h={192}
              loading="lazy"
              w="100%"
            />
          ) : (
            <Flex
              align="center"
              bg={`light-dark(${colorsMantine.gray3}, ${colorsMantine.dark5})`}
              h={192}
              justify="center"
              w="100%"
            >
              <IconSeo
                color={`light-dark(${colorsMantine.white}, ${colorsMantine.white})`}
                icon={faImage}
                size="5x"
              />
            </Flex>
          )}
          <Box
            bg={colorsMantine.blackOpacity0}
            bottom={0}
            left={0}
            pos="absolute"
            right={0}
            top={0}
          />
        </Box>
      </AspectRatio>
      <Box
        bg={colorsMantine.whiteOpacity8}
        left={12}
        pos="absolute"
        px={10}
        py={2}
        style={{
          borderRadius: 10,
        }}
        top={12}
      >
        <Text
          c="black"
          fw="bold"
          size="xs"
          style={{
            userSelect: "none",
          }}
        >
          {t("cardSearchListing.added", {
            date: replaceDateToYearMonthDay(
              dayjs(listing.createdAt).toISOString(),
            ),
          })}
        </Text>
      </Box>
      <Flex
        align="flex-end"
        bottom={74}
        direction="column"
        gap={4}
        justify="flex-end"
        pos="absolute"
        right={0}
        w="100%"
      >
        <Box
          bg={platformColor}
          px={10}
          py={2}
          style={{
            borderBottomLeftRadius: 10,
            borderTopLeftRadius: 10,
          }}
        >
          <Text
            c="white"
            fw="bold"
            size="xs"
            style={{
              userSelect: "none",
            }}
          >
            {t(`listingCategory.${listing.category}`)}
          </Text>
        </Box>
        <Box
          bg={platformColor}
          px={10}
          py={2}
          style={{
            borderBottomLeftRadius: 10,
            borderTopLeftRadius: 10,
          }}
        >
          <Text
            c="white"
            fw="bold"
            size="xs"
            style={{
              userSelect: "none",
            }}
          >
            {t(`workMode.${listing.workMode}`)}
          </Text>
        </Box>
        {(listing?.salaryFrom != null || listing?.salaryTo != null) && (
          <Box
            bg={platformColor}
            px={10}
            py={2}
            style={{
              borderBottomLeftRadius: 10,
              borderTopLeftRadius: 10,
            }}
          >
            <Text
              c="white"
              fw="bold"
              lineClamp={1}
              size="xs"
              style={{
                userSelect: "none",
              }}
            >
              {generateSalaryRange({
                salaryFrom: listing.salaryFrom,
                salaryTo: listing.salaryTo,
                tCommon: t,
              })}
            </Text>
          </Box>
        )}
      </Flex>
      {/* <Box
        bg={colorsMantine.blackOpacity4}
        p={8}
        pb={4}
        pos="absolute"
        right={0}
        style={{
          borderBottomLeftRadius: 10,
          cursor: "pointer",
        }}
        top={0}
        onClick={() => {}}
      >
        <Tooltip
          label={t("cardSearchListing.addToFavorite")}
          withCursorNotAllowed={false}
        >
          <IconSeo
            color={colorsMantine.white}
            icon={faHeart}
            size="xl"
            variant="regular"
          />
        </Tooltip>
      </Box> */}
    </Flex>
  );
};

export const CardSearchListingSmall = memo(CardSearchListingSmallToMemoize);

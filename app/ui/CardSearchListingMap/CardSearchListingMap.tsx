import { faChevronRight, faImage } from "@fortawesome/free-solid-svg-icons";
import { AspectRatio, Box, Flex } from "@mantine/core";
import type { MouseEvent } from "react";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { globalIds } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { E_ListingType } from "~/models/enums";
import { T_ListingsMap } from "~/models/listingsMap";
import { Image } from "~/ui/Image";
import { generateLocationAddress } from "~/utilities/functions";
import { generateListingPriceToShowFromTypeAndContractType } from "~/utilities/price";

import { IconSeo } from "../IconSeo";
import { Text } from "../Text";

type T_CardSearchListingMap = {
  listingMap: T_ListingsMap[number];
  showOnlyImage?: boolean;
};

const CardSearchListingMapToMemoize = ({
  listingMap,
  showOnlyImage = false,
}: T_CardSearchListingMap) => {
  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { getLocalizedRoute } = useLocalizedRoute();
  const { platformColor } = useLayout();
  const navigate = useNavigate();

  const firstImage =
    listingMap.images?.find(img => img.isDefault)?.url ||
    listingMap.images?.at(0)?.url;

  const handleGoToListing = useCallback(() => {
    navigate(
      getLocalizedRoute({
        extraPath: `/${listingMap.slug ?? listingMap.id}`,
        route: E_Routes.listings,
      }),
    );
  }, [listingMap, navigate]);

  const handleGoToListingNewPage = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.button === 1) {
        event.preventDefault();
        window.open(
          getLocalizedRoute({
            extraPath: `/${listingMap.slug ?? listingMap.id}`,
            route: E_Routes.listings,
          }),
          "_blank",
          "noopener",
        );
      }
    },
    [listingMap],
  );

  return (
    <Flex
      align="flex-end"
      h={showOnlyImage ? 192 : 263}
      id={globalIds.cardSearchListing}
      justify="flex-start"
      pos="relative"
      style={{
        borderRadius: 20,
        overflow: "hidden",
      }}
      w={256}
    >
      {!showOnlyImage && (
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
          w="100%"
        >
          <Box w="calc(100% - 20px)">
            <Text c="white" fw="bold" lineClamp={1} m={0} size="md">
              {`${listingMap.title},`}
            </Text>
            {listingMap.location && (
              <Text c="white" fw="bold" lineClamp={1} m={0} size="sm">
                {generateLocationAddress({
                  city: listingMap.location.city ?? null,
                  cityCustom: listingMap.location.cityCustom ?? null,
                  district: listingMap.location.district ?? null,
                  flatNumber: listingMap.location.flatNumber,
                  streetName: listingMap.location.streetName,
                  streetNumber: listingMap.location.streetNumber,
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
      )}
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
              style={{
                zIndex: 0,
              }}
              w="100%"
            />
          ) : (
            <Flex
              align="center"
              bg={`light-dark(${colorsMantine.gray3}, ${colorsMantine.dark5})`}
              h={220}
              justify="center"
              w="100%"
            >
              <IconSeo
                color={`light-dark(${colorsMantine.white}, ${colorsMantine.white})`}
                icon={faImage}
                size="5x"
                style={{
                  zIndex: 0,
                }}
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
      <Flex
        align="flex-end"
        bottom={showOnlyImage ? 8 : 74}
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
          <Text c="white" fw="bold" size="xs" span>
            {`${t(`listingType.${listingMap.type}`)}${listingMap.contractType && listingMap.type === E_ListingType.RENT ? ` ${t(`listingContractTypeSingle.${listingMap.contractType}`)}` : ""}`}
          </Text>
        </Box>
        {listingMap?.area && (
          <Box
            bg={platformColor}
            px={10}
            py={2}
            style={{
              borderBottomLeftRadius: 10,
              borderTopLeftRadius: 10,
            }}
          >
            <Text c="white" fw="bold" size="xs" span>
              {t("cardSearchListing.area", {
                count: Number(listingMap.area),
              })}
            </Text>
          </Box>
        )}
        {listingMap?.price && (
          <Box
            bg={platformColor}
            px={10}
            py={2}
            style={{
              borderBottomLeftRadius: 10,
              borderTopLeftRadius: 10,
            }}
          >
            <Text c="white" fw="bold" lineClamp={1} m={0} size="xs" span>
              {generateListingPriceToShowFromTypeAndContractType({
                contractType: listingMap.contractType,
                negotiable: listingMap.negotiable,
                negotiableAsterisk: true,
                price: listingMap.price,
                tCommon: t,
                type: listingMap.type,
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
            icon={faHeart}
            color={colorsMantine.white}
            size="xl"
            variant="regular"
          />
        </Tooltip>
      </Box> */}
    </Flex>
  );
};

export const CardSearchListingMap = memo(CardSearchListingMapToMemoize);

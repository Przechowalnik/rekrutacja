import { faImage } from "@fortawesome/free-solid-svg-icons";
import { AspectRatio, Box, Flex } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { globalClasses } from "~/constants/styles";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { T_Listings } from "~/models/listings";
import { stripHtmlTags } from "~/utilities/converter";
import { generateLocationAddress } from "~/utilities/functions";
import { generateSalaryRange } from "~/utilities/price";

import { Badge } from "../Badge";
import { Button } from "../Button";
import { IconSeo } from "../IconSeo";
import { Image } from "../Image";
import { Link } from "../Link";
import { Text } from "../Text";

type T_CardSearchListing = {
  backgroundSecondary?: boolean;
  listing: T_Listings[number];
};

const CardSearchListingToMemoize = ({
  backgroundSecondary = false,
  listing,
}: T_CardSearchListing) => {
  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { getLocalizedRoute } = useLocalizedRoute();

  const firstImage =
    listing?.images?.find(img => img.isDefault)?.url ||
    listing?.images?.at(0)?.url;

  return (
    <Flex
      align="flex-start"
      bg={
        backgroundSecondary
          ? `light-dark(${colorsMantine.gray1}, ${colorsMantine.gray9})`
          : undefined
      }
      className={globalClasses.fadePage}
      direction={{
        base: "column",
        md: "row",
      }}
      h={{
        base: "auto",
        md: "300px",
      }}
      justify="space-between"
      maw={{
        base: "350px",
        md: "100%",
        sm: "500px",
      }}
      miw={300}
      pos="relative"
      style={{
        border: `1px solid light-dark(${colorsMantine.gray3}, ${colorsMantine.dark4})`,
        borderRadius: "20px",
        overflow: "hidden",
      }}
      w="100%"
    >
      <Box
        pos="relative"
        w={{
          base: "100%",
          md: "420px",
        }}
      >
        <Link
          fullWidth
          h="100%"
          to={getLocalizedRoute({
            extraPath: `/${listing.slug ?? listing.id}`,
            route: E_Routes.listings,
          })}
        >
          <AspectRatio
            h={{
              base: 246,
              md: 297,
            }}
            pos="relative"
            ratio={4 / 3}
            style={{
              cursor: "pointer",
              overflow: "hidden",
            }}
            w="100%"
          >
            {firstImage ? (
              <Image
                alt={tSeo("imagesAlt.imageListing")}
                customSrc={firstImage}
                fit="cover"
                h={{
                  base: 246,
                  md: 297,
                }}
                loading="lazy"
                w="100%"
              />
            ) : (
              <Flex
                align="center"
                bg={`light-dark(${colorsMantine.dark0}, ${colorsMantine.dark5})`}
                h="100%"
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
          </AspectRatio>
        </Link>
      </Box>
      <Flex
        align="flex-start"
        direction={{
          base: "column",
          md: "row",
        }}
        gap={16}
        h="100%"
        justify="flex-start"
        pb={16}
        pt={10}
        px={16}
        w={{
          base: "100%",
          md: "calc(100% - 420px)",
        }}
      >
        <Flex
          align="flex-start"
          direction="column"
          h="100%"
          justify="space-between"
          w={{
            base: "100%",
            md: "calc(100% - 220px)",
          }}
        >
          <Box w="100%">
            <Text fw="bold" lineClamp={1} size="lg">
              {`${listing.title},`}
            </Text>
            {listing.location && (
              <Text c="violet" fw="bold" size="sm">
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
            {listing?.description && (
              <Text lineClamp={2} pt={12} size="sm">
                {stripHtmlTags(listing.description)}
              </Text>
            )}
          </Box>
          <Flex
            align="flex-start"
            direction="column"
            gap={8}
            justify="flex-end"
            pt={16}
          >
            <Badge size="md" variant="dot">
              {t(`listingCategory.${listing.category}`)}
            </Badge>
            <Badge size="md" variant="dot">
              {t(`workMode.${listing.workMode}`)}
            </Badge>
            {(listing?.salaryFrom != null || listing?.salaryTo != null) && (
              <Badge color="teal" size="md" variant="dot">
                {generateSalaryRange({
                  salaryFrom: listing.salaryFrom,
                  salaryTo: listing.salaryTo,
                  tCommon: t,
                })}
              </Badge>
            )}
          </Flex>
        </Flex>
        <Flex
          align="flex-end"
          direction="column"
          gap={12}
          h="100%"
          justify="space-between"
          pt={4}
          w={{
            base: "100%",
            md: "220px",
          }}
        >
          <div></div>
          <Box
            w={{
              base: "100%",
              md: "auto",
            }}
          >
            <Link
              fullWidth
              to={getLocalizedRoute({
                extraPath: `/${listing.slug}`,
                route: E_Routes.listings,
              })}
            >
              <Button
                variant="light"
                w={{
                  base: "100%",
                  md: "auto",
                }}
              >
                {t("cardSearchListing.buttonDetails")}
              </Button>
            </Link>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const CardSearchListing = memo(CardSearchListingToMemoize);

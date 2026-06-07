import { faMobileScreen } from "@fortawesome/free-solid-svg-icons";
import { Box, Flex } from "@mantine/core";
import dayjs from "dayjs";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUserCookie } from "~/hooks/useUserCookie";
import { T_Listing } from "~/models/listing";
import { replaceDateInDayjsToYearMonthDay } from "~/utilities/date";
import { generatePhoneToShow } from "~/utilities/functions";

import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { Collapse } from "../Collapse";
import { IconSeo } from "../IconSeo";
import { Link } from "../Link";
import { Text } from "../Text";

type T_AvatarListing = {
  listing: T_Listing;
};

const AvatarListingToMemoize = ({ listing }: T_AvatarListing) => {
  const [incrementCountContact, setIncrementCountContact] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const fetcher = useFetcherWithActions({
    disabledLoader: true,
  });
  const { userCookie } = useUserCookie();
  const { t } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();

  const handleShowPhone = useCallback(() => {
    if (!showPhone && !incrementCountContact) {
      setIncrementCountContact(true);
      if (!userCookie || userCookie?.userId !== listing?.user?.id) {
        fetcher.submit(
          {},
          {
            action: getLocalizedRoute({
              extraPath: `/${listing.slug ?? listing.id}`,
              route: E_Routes.listings,
            }),
            method: "patch",
          },
        );
      }
    }
    setShowPhone(previousState => !previousState);
  }, [showPhone, userCookie, listing]);

  const handleGoToSms = useCallback(() => {
    if (!userCookie || userCookie?.userId !== listing?.user?.id) {
      fetcher.submit(
        {},
        {
          action: getLocalizedRoute({
            extraPath: `/${listing.slug ?? listing.id}`,
            route: E_Routes.listings,
          }),
          method: "patch",
        },
      );
    }
  }, [userCookie, listing]);

  return (
    <Flex
      align={{
        base: "center",
        xs: "flex-start",
      }}
      direction="column"
      justify="flex-start"
    >
      <Flex
        align="center"
        direction={{
          base: "column",
          xs: "row",
        }}
        gap={12}
        justify="flex-start"
      >
        <Avatar
          name={
            listing?.company
              ? listing.company.name
              : `${listing?.user?.firstName?.at(0)?.toUpperCase()} ${listing?.user?.firstName?.at(1)?.toUpperCase()}`
          }
          size="xl"
          url={
            listing?.company
              ? (listing.company.avatar ?? undefined)
              : (listing?.user?.avatar ?? undefined)
          }
          withBorder={false}
        />
        <Flex align="flex-start" direction="column" justify="flex-start">
          <Text size="md" withHTML>
            {t("avatarListing.added", {
              date: replaceDateInDayjsToYearMonthDay(dayjs(listing.createdAt)),
            })}
          </Text>
          <Text size="md" withHTML>
            {t("avatarListing.author", {
              name: listing?.company
                ? listing?.company?.name?.toUpperCase()
                : listing?.user?.firstName?.toUpperCase(),
            })}
          </Text>
        </Flex>
      </Flex>
      <Box
        pl={{
          base: 0,
          xs: 96,
        }}
        pt={{
          base: 8,
          xs: 0,
        }}
        w="100%"
      >
        <Button
          color="black"
          leftSection={<IconSeo icon={faMobileScreen} size="lg" />}
          maw={{
            base: "auto",
            xs: 240,
          }}
          onClick={handleShowPhone}
          size="sm"
          variant="filled"
          w="100%"
        >
          {showPhone
            ? t("avatarListing.buttonHidePhone")
            : t("avatarListing.buttonShowPhone")}
        </Button>
        <Collapse opened={showPhone}>
          <Link
            c={`light-dark(${colorsMantine.black}, ${colorsMantine.white})`}
            customHref={`tel:${generatePhoneToShow({
              phone: listing?.company
                ? listing.company.phone
                : listing?.user?.phone,
              safeReturn: false,
              withCountryCode: false,
            })}`}
            onClick={handleGoToSms}
          >
            <Text center fw="bold" hiddenFrom="xs" pt={8} size="md">
              {generatePhoneToShow({
                phone: listing?.company
                  ? listing.company.phone
                  : listing?.user?.phone,
              })}
            </Text>
            <Text fw="bold" pt={8} size="md" visibleFrom="xs">
              {generatePhoneToShow({
                phone: listing?.company
                  ? listing.company.phone
                  : listing?.user?.phone,
              })}
            </Text>
          </Link>
        </Collapse>
        <Box hiddenFrom="xs" pt={12}>
          <Link
            customHref={`sms:+${listing?.user?.phone?.countryCode}${listing?.user?.phone?.number}`}
          >
            <Button
              leftSection={<IconSeo icon={faMobileScreen} size="lg" />}
              maw={{
                base: "auto",
                xs: 240,
              }}
              size="sm"
              variant="light"
              w="100%"
            >
              {t("avatarListing.buttonSendSms")}
            </Button>
          </Link>
        </Box>
      </Box>
    </Flex>
  );
};

export const AvatarListing = memo(AvatarListingToMemoize);

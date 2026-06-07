import { Alert, Box, Flex, List } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLayout } from "~/hooks/useLayout";
import { useUserCookie } from "~/hooks/useUserCookie";
import { E_Roles } from "~/models/enums";
import { isFreeListings } from "~/utilities/flags";

import { Button } from "../Button";
import { Image } from "../Image";
import { Text } from "../Text";
import { Title } from "../Title";

type T_BannerIntroRent = {
  smallTopPadding?: boolean;
};

const BannerIntroRentToMemoize = ({ smallTopPadding }: T_BannerIntroRent) => {
  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { platformColor } = useLayout();
  const { userCookie } = useUserCookie();

  const routeTo = (() => {
    if (!userCookie) {
      return E_Routes.loginFromCreateListing;
    }

    if (userCookie.userCompanyId) {
      return E_Routes.companyListingsNew;
    }

    return E_Routes.accountListingsNew;
  })();

  const buttonCreateListing = userCookie?.userRole?.includes(
    E_Roles.ADMIN,
  ) ? null : (
    <Button
      color="black"
      routeTo={routeTo}
      w={{
        base: "100%",
        md: "500px",
      }}
    >
      {userCookie?.userCompanyId
        ? t("navigation.addListingCompany")
        : t("navigation.addListing")}
    </Button>
  );

  const informationFreeListings = (
    <Alert color="teal">
      <Text c="teal" center fw="bold" size="md">
        {t("bannerIntroRent.informationFreeListings")}
      </Text>
    </Alert>
  );

  const checkIsFreeListings = isFreeListings();

  return (
    <Flex
      align="center"
      direction={{
        base: "column-reverse",
        md: "row",
      }}
      gap={24}
      justify="center"
      pt={smallTopPadding ? 24 : undefined}
      py={{
        base: 64,
        sm: 80,
      }}
      wrap="wrap"
    >
      {checkIsFreeListings && (
        <Box visibleFrom="md" w="100%">
          {informationFreeListings}
        </Box>
      )}
      <Box hiddenFrom="md" w="100%">
        {buttonCreateListing}
      </Box>
      <Flex
        align="center"
        direction="column"
        gap={32}
        justify="center"
        w={{
          base: "100%",
          md: "calc(40% - 12px)",
        }}
      >
        <Image
          alt={tSeo("imagesAlt.bannerRentHorizontally")}
          fit="fill"
          h={139}
          hiddenFrom="md"
          path={{
            format: "webp",
            pathWithColorMode: false,
            pathWithDevice: false,
            pathWithLanguage: false,
            src: "/images/bannerRentHorizontally",
          }}
          sizes="302px"
          w={302}
        />
        <Image
          alt={tSeo("imagesAlt.bannerRent")}
          fit="fill"
          h={400}
          mah={{
            base: 320,
            md: "100%",
          }}
          maw={550}
          path={{
            format: "webp",
            pathWithColorMode: false,
            pathWithDevice: false,
            pathWithLanguage: false,
            src: "/images/bannerRent",
          }}
          sizes="550px"
          visibleFrom="md"
          w="auto"
        />
      </Flex>
      <Box
        w={{
          base: "100%",
          md: "calc(60% - 12px)",
        }}
      >
        <Title hiddenFrom="sm" order={2} size="h2">
          {t("bannerIntroRent.title1")}
        </Title>
        <Title order={2} size="h1" visibleFrom="sm">
          {t("bannerIntroRent.title1")}
        </Title>
        <Title c={platformColor} hiddenFrom="sm" order={3} size="h2">
          {t("bannerIntroRent.title2")}
        </Title>
        <Title c={platformColor} order={3} size="h1" visibleFrom="sm">
          {t("bannerIntroRent.title2")}
        </Title>
        <Title order={4} pb={12} pt={24} size="xl">
          {t("bannerIntroRent.paragraph1")}
        </Title>
        <List c={platformColor} fw="bold" pr={24} spacing={16} type="ordered">
          <List.Item>
            <Title fw="bold" order={5}>
              {t("bannerIntroRent.list1.title")}
            </Title>
            <Text
              c={`light-dark(${colorsMantine.dark}, ${colorsMantine.white})`}
              fw="normal"
              maw={600}
              size="sm"
            >
              {t("bannerIntroRent.list1.paragraph")}
            </Text>
          </List.Item>
          <List.Item>
            <Title fw="bold" order={5}>
              {t("bannerIntroRent.list2.title")}
            </Title>
            <Text
              c={`light-dark(${colorsMantine.dark}, ${colorsMantine.white})`}
              fw="normal"
              maw={600}
              size="sm"
            >
              {t("bannerIntroRent.list2.paragraph")}
            </Text>
          </List.Item>
          {!isFreeListings && (
            <List.Item>
              <Title fw="bold" order={5}>
                {t("bannerIntroRent.list3.title")}
              </Title>
              <Text
                c={`light-dark(${colorsMantine.dark}, ${colorsMantine.white})`}
                fw="normal"
                maw={600}
                size="sm"
              >
                {t("bannerIntroRent.list3.paragraph")}
              </Text>
            </List.Item>
          )}
          <List.Item>
            <Title fw="bold" order={5}>
              {t("bannerIntroRent.list4.title")}
            </Title>
            <Text
              c={`light-dark(${colorsMantine.dark}, ${colorsMantine.white})`}
              fw="normal"
              maw={500}
              size="sm"
            >
              {t("bannerIntroRent.list4.paragraph")}
            </Text>
          </List.Item>
        </List>
      </Box>
      {checkIsFreeListings && (
        <Box hiddenFrom="md">{informationFreeListings}</Box>
      )}
      <Flex align="center" justify="center" pt={48} visibleFrom="md" w="100%">
        {buttonCreateListing}
      </Flex>
    </Flex>
  );
};

export const BannerIntroRent = memo(BannerIntroRentToMemoize);

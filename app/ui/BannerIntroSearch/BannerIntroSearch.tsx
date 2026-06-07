import { Box, Flex, List } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLayout } from "~/hooks/useLayout";

import { Button } from "../Button";
import { Image } from "../Image";
import { Text } from "../Text";
import { Title } from "../Title";

type T_BannerIntroSearch = {
  smallPaddingTop?: boolean;
};

const BannerIntroSearchToMemoize = ({
  smallPaddingTop,
}: T_BannerIntroSearch) => {
  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { platformColor } = useLayout();

  return (
    <Flex
      align="center"
      direction={{
        base: "column",
        md: "row",
      }}
      gap={24}
      justify="center"
      pb={{
        base: 64,
        sm: 80,
      }}
      pt={{
        base: smallPaddingTop ? 24 : 64,
        sm: smallPaddingTop ? 48 : 80,
      }}
    >
      <Box
        w={{
          base: "100%",
          md: "calc(60% - 12px)",
        }}
      >
        <Title hiddenFrom="sm" order={1} size="h2">
          {t("bannerIntroSearch.title1")}
        </Title>
        <Title order={1} size="h1" visibleFrom="sm">
          {t("bannerIntroSearch.title1")}
        </Title>
        <Title c={platformColor} hiddenFrom="sm" order={2} size="h2">
          {t("bannerIntroSearch.title2")}
        </Title>
        <Title c={platformColor} order={2} size="h1" visibleFrom="sm">
          {t("bannerIntroSearch.title2")}
        </Title>
        <Title order={3} pb={12} pt={24} size="xl">
          {t("bannerIntroSearch.paragraph1")}
        </Title>
        <List c={platformColor} fw="bold" pr={24} spacing={16} type="ordered">
          <List.Item>
            <Title fw="bold" order={4}>
              {t("bannerIntroSearch.list1.title")}
            </Title>
            <Text
              c={`light-dark(${colorsMantine.dark}, ${colorsMantine.white})`}
              fw="normal"
              maw={500}
              size="sm"
            >
              {t("bannerIntroSearch.list1.paragraph")}
            </Text>
          </List.Item>
          <List.Item>
            <Title fw="bold" order={4}>
              {t("bannerIntroSearch.list2.title")}
            </Title>
            <Text
              c={`light-dark(${colorsMantine.dark}, ${colorsMantine.white})`}
              fw="normal"
              maw={500}
              size="sm"
            >
              {t("bannerIntroSearch.list2.paragraph")}
            </Text>
          </List.Item>
          <List.Item>
            <Title fw="bold" order={4}>
              {t("bannerIntroSearch.list3.title", {
                buttonName: t("navigation.header.button"),
              })}
            </Title>
            <Text
              c={`light-dark(${colorsMantine.dark}, ${colorsMantine.white})`}
              fw="normal"
              maw={500}
              size="sm"
            >
              {t("bannerIntroSearch.list3.paragraph")}
            </Text>
          </List.Item>
        </List>
      </Box>
      <Flex
        align={{
          base: "center",
          md: "flex-end",
        }}
        direction="column"
        gap={32}
        justify="center"
        w={{
          base: "100%",
          md: "calc(60% - 12px)",
        }}
      >
        <Image
          alt={tSeo("imagesAlt.banner")}
          fetchPriority="high"
          fit="fill"
          h={218}
          loading="eager"
          path={{
            format: "webp",
            pathWithColorMode: false,
            pathWithDevice: false,
            pathWithLanguage: false,
            src: "/images/banner",
          }}
          sizes="550px"
          w={550}
        />
        <Flex
          align="center"
          direction="column"
          gap={12}
          justify="center"
          w="100%"
        >
          <Button
            color="black"
            routeTo={E_Routes.home}
            w={{
              base: "100%",
              md: 400,
            }}
          >
            {t("bannerIntroSearch.button")}
          </Button>
          <Button
            routeTo={E_Routes.search}
            variant="light"
            w={{
              base: "100%",
              md: 400,
            }}
          >
            {t("bannerIntroSearch.buttonSearch")}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const BannerIntroSearch = memo(BannerIntroSearchToMemoize);

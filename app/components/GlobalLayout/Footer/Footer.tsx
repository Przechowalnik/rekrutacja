import { Box, Button, Flex } from "@mantine/core";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useCookieConsent } from "~/hooks/useCookieConsent";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUserCookie } from "~/hooks/useUserCookie";
import { Link } from "~/ui/Link";
import { Text } from "~/ui/Text";

import { generateFooter } from "./utilities";

const Footer = () => {
  const { t } = useTranslation(namespaces.common);
  const location = useLocation();
  const { userCookie } = useUserCookie();
  const { isMobile } = useLayout();
  const { getLocalizedRoute } = useLocalizedRoute();
  const { openSettings } = useCookieConsent();

  const isAdminPages = location.pathname.includes(
    getLocalizedRoute({
      route: E_Routes.admin,
    }),
  );

  const isAccountPages = location.pathname.includes(
    getLocalizedRoute({
      route: E_Routes.account,
    }),
  );

  const isCompanyPages = location.pathname.includes(
    getLocalizedRoute({
      route: E_Routes.company,
    }),
  );

  const isValidPage = !isAdminPages && !isAccountPages && !isCompanyPages;

  const handleClickConsents = useCallback(() => {
    openSettings();
  }, [openSettings]);

  const generatedFooter = generateFooter({
    getLocalizedRoute,
    t,
    userCookie,
  });

  const mapGeneratedFooter = generatedFooter.map((item, index) => {
    const mapRoutes = item.routes.map(itemRoute => {
      return (
        <Link
          c={colorsMantine.gray4}
          display="block"
          download={!!itemRoute.reloadDocument && isMobile}
          fullWidth
          fw="normal"
          key={`route_${itemRoute.url}`}
          py={9}
          size="md"
          target={itemRoute.reloadDocument ? "_blank" : undefined}
          to={itemRoute.url}
          withUnderline
        >
          {itemRoute.title}
        </Link>
      );
    });

    return (
      <Flex
        key={`footerItem_${item.title}`}
        w={{
          base: "100%",
          md: "calc(32% - 18px)",
          sm: "calc(50% - 24px)",
          xs: "50%",
        }}
      >
        <Box maw={240} w="100%">
          <Text c="white" fw="bold" size="xl">
            {item.title}
          </Text>
          <Flex
            align="flex-start"
            direction="column"
            justify="flex-start"
            pt={12}
          >
            {mapRoutes}
            {index === 0 && (
              <Button
                c={colorsMantine.gray4}
                fw="normal"
                h="auto"
                onClick={handleClickConsents}
                p={0}
                py={12}
                size="md"
                style={{
                  textDecoration: "underline",
                }}
                variant="transparent"
              >
                {t("footer.cookiebot")}
              </Button>
            )}
          </Flex>
        </Box>
      </Flex>
    );
  });

  if (!isValidPage) {
    return null;
  }

  return (
    <Flex
      align="center"
      bg="black"
      component="footer"
      direction="column"
      justify="center"
      pl={24}
      pos="relative"
      pr={24}
      py={64}
      w="100%"
    >
      <Flex
        align="flex-start"
        gap={48}
        justify="space-between"
        maw={1200}
        w="100%"
        wrap="wrap"
      >
        {mapGeneratedFooter}
      </Flex>
    </Flex>
  );
};

export default Footer;

import { faUserTie } from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Burger,
  Drawer,
  Flex,
  useMantineColorScheme,
} from "@mantine/core";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUser } from "~/hooks/useUser";
import { E_Language, E_Roles } from "~/models/enums";
import { Button } from "~/ui/Button";
import { IconSeo } from "~/ui/IconSeo";
import { Link } from "~/ui/Link";
import { Logo } from "~/ui/Logo";

type T_NavigationDrawer = {
  close: () => void;
  disabledButtonNew: boolean;
  handleChangeLanguage: () => void;
  handleChangeMode: () => void;
  handleCloseDrawer: () => void;
  handleGoToCompanyProfile: () => void;
  handleGoToHelp: () => void;
  handleGoToListingsNew: () => void;
  handleGoToProfile: () => void;
  opened: boolean;
  toggle: () => void;
};

const NavigationDrawerToMemoize = ({
  close,
  disabledButtonNew,
  handleChangeLanguage,
  handleChangeMode,
  handleCloseDrawer,
  handleGoToCompanyProfile,
  handleGoToHelp,
  handleGoToListingsNew,
  handleGoToProfile,
  opened,
  toggle,
}: T_NavigationDrawer) => {
  const { i18n, t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { colorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });
  const { getLocalizedRoute } = useLocalizedRoute();

  const { logout, userCookie } = useUser({
    fetchUserIfNotExist: false,
    requireSession: false,
  });

  const handleLogout = useCallback(async () => {
    close();
    await logout();
  }, []);

  const routeTo: E_Routes | undefined = (() => {
    if (!disabledButtonNew) {
      return;
    }

    if (!userCookie) {
      return E_Routes.loginFromCreateListing;
    }

    if (userCookie.userCompanyId) {
      return E_Routes.companyPhone;
    }

    return E_Routes.accountPhone;
  })();

  return (
    <Drawer
      closeOnClickOutside
      hiddenFrom="sm"
      onClose={close}
      opened={opened}
      size="sm"
      withCloseButton={false}
      zIndex={2000}
    >
      {userCookie?.userRole?.includes(E_Roles.ADMIN) && (
        <Box left={200} pos="absolute" top={24}>
          <Button
            ariaLabel="admin"
            color="dark.9"
            h={40}
            px={8}
            routeTo={E_Routes.admin}
            size="xs"
            variant="transparent"
          >
            <IconSeo icon={faUserTie} />
          </Button>
        </Box>
      )}
      <Flex align="center" justify="space-between" mb={24}>
        <Link
          forceCurrentLink
          mah={44}
          onClick={toggle}
          to={getLocalizedRoute({
            route: E_Routes.home,
          })}
        >
          <Logo height="51.1px" width="180px" />
        </Link>
        <Burger
          aria-label={tSeo("imagesAlt.burgerMenu")}
          hiddenFrom="sm"
          onClick={toggle}
          opened={opened}
          size="lg"
        />
      </Flex>
      <Flex
        direction="column"
        gap={12}
        h="calc(100dvh - 100px)"
        justify="space-between"
      >
        <Flex direction="column" gap={12} justify="space-between">
          {userCookie && (
            <>
              {userCookie?.userRole !== E_Roles.ADMIN &&
                userCookie?.userRole !== E_Roles.ADMIN_SUPER && (
                  <Button
                    fullWidth
                    onClick={handleGoToListingsNew}
                    routeTo={routeTo}
                    size="md"
                    tooltip={
                      userCookie
                        ? undefined
                        : {
                            label: t(
                              "navigation.tooltipNewListingLoginRequired",
                            ),
                          }
                    }
                  >
                    {userCookie?.userCompanyId
                      ? t("navigation.addListingCompany")
                      : t("navigation.addListing")}
                  </Button>
                )}
              <Button
                fullWidth
                h={40}
                onClick={handleGoToProfile}
                px={8}
                variant="light"
              >
                {t("navigation.user")}
              </Button>
            </>
          )}
          {userCookie?.userCompanyId && (
            <Button
              fullWidth
              h={40}
              onClick={handleGoToCompanyProfile}
              px={8}
              variant="light"
            >
              {t("navigation.company")}
            </Button>
          )}
          {userCookie && (
            <Button
              color="red"
              fullWidth
              h={40}
              onClick={handleLogout}
              px={8}
              type="submit"
              variant="light"
            >
              {t("navigation.tooltipLogout")}
            </Button>
          )}
          {!userCookie && (
            <>
              <Button
                fullWidth
                onClick={handleCloseDrawer}
                routeTo={E_Routes.registration}
                variant="light"
              >
                {t("navigation.buttonRegistration")}
              </Button>
              <Button
                fullWidth
                onClick={handleCloseDrawer}
                routeTo={E_Routes.login}
                variant="light"
              >
                {t("navigation.buttonLogin")}
              </Button>
              <Button
                disabled={disabledButtonNew}
                fullWidth
                onClick={handleGoToListingsNew}
                routeTo={E_Routes.loginFromCreateListing}
                size="md"
                tooltip={{
                  label: t("navigation.tooltipNewListingLoginRequired"),
                }}
                variant="gradient"
              >
                {t("navigation.addListing")}
              </Button>
            </>
          )}
        </Flex>
        <Flex direction="column" gap={12} justify="space-between">
          <Button
            color="orange"
            fullWidth
            onClick={handleGoToHelp}
            variant="light"
          >
            {t("navigation.buttonHelp")}
          </Button>
          <Button
            fullWidth
            h={40}
            onClick={handleChangeLanguage}
            px={8}
            variant="light"
          >
            {i18n.language === E_Language.EN.toLowerCase()
              ? t("navigation.tooltipLanguagePL")
              : t("navigation.tooltipLanguageEN")}
          </Button>
          <Button
            fullWidth
            h={40}
            onClick={handleChangeMode}
            px={8}
            variant="light"
          >
            {colorScheme === "dark"
              ? t("navigation.tooltipLightMode")
              : t("navigation.tooltipDarkMode")}
          </Button>
        </Flex>
      </Flex>
    </Drawer>
  );
};

export const NavigationDrawer = memo(NavigationDrawerToMemoize);

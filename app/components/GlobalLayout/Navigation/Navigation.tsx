import {
  faArrowLeft,
  faCircleHalfStroke,
  faLanguage,
  faQuestionCircle,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { Box, Burger, Flex, useMantineColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useCookies } from "~/hooks/useCookies";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUserCookie } from "~/hooks/useUserCookie";
import { E_Language, E_Roles } from "~/models/enums";
import { Avatar } from "~/ui/Avatar";
import { Button } from "~/ui/Button";
import { Collapse } from "~/ui/Collapse";
import { IconSeo } from "~/ui/IconSeo";
import { Link } from "~/ui/Link";
import { Logo } from "~/ui/Logo";
import { Text } from "~/ui/Text";
import { Tooltip } from "~/ui/Tooltip";

const NavigationDrawer = dynamic(() =>
  import("~/components/GlobalLayout/Navigation/NavigationDrawer").then(
    module => ({
      default: module.NavigationDrawer,
    }),
  ),
);

const NavigationToMemoize = () => {
  const { i18n, t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { userCookie } = useUserCookie();
  const { getLocalizedRoute } = useLocalizedRoute();
  const { colorScheme, setColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });
  const location = useLocation();
  const { isEmailDisabled, isOtpCodeDisabled, isSMSDisabled } = useCookies();
  const navigate = useNavigate();
  const [opened, { close, toggle }] = useDisclosure();
  const fetcherUserLanguage = useFetcherWithActions({});
  // NOSONAR
  // const [colorSchemaBeforeChange, setColorSchemaBeforeChange] =
  //   useState<MantineColorScheme>("light");

  // NOSONAR
  // const isActiveDarkModeInCompany = user?.company?.settings?.enableDarkModeAt;

  const isHomePage =
    location.pathname ===
    getLocalizedRoute({
      route: E_Routes.home,
    });

  const disabledButtonNew = userCookie
    ? !!userCookie?.userRole?.includes(E_Roles.ADMIN)
    : true;

  // NOSONAR
  // useEffect(() => {
  //   setColorSchemaBeforeChange(colorScheme);
  // }, []);

  // NOSONAR
  // useEffect(() => {
  //   if (user?.company?.settings) {
  //     if (isActiveDarkModeInCompany) {
  //       setColorScheme("dark");
  //     } else {
  //       setColorScheme("light");
  //     }
  //   } else {
  //     setColorScheme(colorSchemaBeforeChange);
  //   }
  // }, [isActiveDarkModeInCompany, user]);

  const handleChangeLanguage = useCallback(() => {
    const currentLang = i18n.language.toLowerCase();
    const currentPath = location.pathname;

    // Calculate the new URL based on current language
    let newUrl: string;
    // eslint-disable-next-line unicorn/prefer-ternary
    if (currentLang === E_Language.EN.toLowerCase()) {
      newUrl = currentPath.replace(/^\/en/, "") || "/";
    } else {
      newUrl = `/${E_Language.EN.toLowerCase()}${currentPath}`;
    }

    // For logged-in users, also save preference to account
    if (userCookie) {
      fetcherUserLanguage.submit(
        {},
        {
          action: getLocalizedRoute({ route: E_Routes.apiAccountLanguage }),
          method: "patch",
        },
      );
    }

    globalThis.location.href = newUrl;
  }, [i18n.language, location.pathname, userCookie]);

  const handleChangeMode = useCallback(() => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme]);

  const handleCloseDrawer = useCallback(() => {
    close();
  }, []);

  const handleGoToProfile = useCallback(() => {
    handleCloseDrawer();
    if (
      location.pathname ===
      getLocalizedRoute({
        route: E_Routes.account,
      })
    ) {
      return;
    }

    sessionStorage.removeItem(
      getLocalizedRoute({
        route: E_Routes.account,
      }),
    );

    sessionStorage.removeItem(
      getLocalizedRoute({
        route: E_Routes.company,
      }),
    );

    navigate(
      getLocalizedRoute({
        route: E_Routes.account,
      }),
    );
  }, [location]);

  const handleGoToCompanyProfile = useCallback(() => {
    handleCloseDrawer();
    if (
      location.pathname ===
      getLocalizedRoute({
        route: E_Routes.company,
      })
    ) {
      return;
    }

    sessionStorage.removeItem(
      getLocalizedRoute({
        route: E_Routes.account,
      }),
    );

    sessionStorage.removeItem(
      getLocalizedRoute({
        route: E_Routes.company,
      }),
    );

    navigate(
      getLocalizedRoute({
        route: E_Routes.company,
      }),
    );
  }, [location]);

  const handleGoToHelp = useCallback(() => {
    handleCloseDrawer();
    if (
      location.pathname ===
      getLocalizedRoute({
        route: E_Routes.help,
      })
    ) {
      return;
    }

    sessionStorage.removeItem(
      getLocalizedRoute({
        route: E_Routes.account,
      }),
    );

    sessionStorage.removeItem(
      getLocalizedRoute({
        route: E_Routes.company,
      }),
    );

    navigate(
      getLocalizedRoute({
        route: E_Routes.help,
      }),
    );
  }, [location]);

  const handleGoToListingsNew = useCallback(() => {
    handleCloseDrawer();
    if (!userCookie) {
      return;
    }

    if (
      location.pathname ===
      getLocalizedRoute({
        route: userCookie?.userCompanyId
          ? E_Routes.companyListingsNew
          : E_Routes.accountListingsNew,
      })
    ) {
      return;
    }

    sessionStorage.removeItem(
      getLocalizedRoute({
        route: E_Routes.account,
      }),
    );

    sessionStorage.removeItem(
      getLocalizedRoute({
        route: E_Routes.company,
      }),
    );

    navigate(
      getLocalizedRoute({
        route: userCookie.userCompanyId
          ? E_Routes.companyListingsNew
          : E_Routes.accountListingsNew,
      }),
    );
  }, [location, userCookie]);

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

  const tooltipLabel: string = (() => {
    if (!userCookie) {
      return t("navigation.tooltipNewListingLoginRequired");
    }

    if (userCookie.userCompanyId) {
      return t("navigation.tooltipNewListingDisabledCompany");
    }

    return t("navigation.tooltipNewListingDisabledAccount");
  })();

  const buttonCreateListing = userCookie?.userRole?.includes(
    E_Roles.ADMIN,
  ) ? null : (
    <Button
      color="dark"
      onClick={handleGoToListingsNew}
      routeTo={routeTo}
      size="sm"
      tooltip={{
        label: tooltipLabel,
      }}
      variant="white"
    >
      {userCookie?.userCompanyId
        ? t("navigation.addListingCompany")
        : t("navigation.addListing")}
    </Button>
  );

  return (
    <>
      <NavigationDrawer
        close={close}
        disabledButtonNew={disabledButtonNew}
        handleChangeLanguage={handleChangeLanguage}
        handleChangeMode={handleChangeMode}
        handleCloseDrawer={handleCloseDrawer}
        handleGoToCompanyProfile={handleGoToCompanyProfile}
        handleGoToHelp={handleGoToHelp}
        handleGoToListingsNew={handleGoToListingsNew}
        handleGoToProfile={handleGoToProfile}
        opened={opened}
        toggle={toggle}
      />
      <Box
        bg={colorsMantine.primary7}
        component="nav"
        left={0}
        pos="fixed"
        right={0}
        style={{
          overflow: "hidden",
          zIndex: 1000,
        }}
        top={0}
      >
        {userCookie?.userRole?.includes(E_Roles.ADMIN) && (
          <Button
            ariaLabel="admin"
            color="dark.9"
            h={22}
            pos="absolute"
            px={2}
            right={0}
            routeTo={E_Routes.admin}
            size="xs"
            style={{
              zIndex: 1100,
            }}
            variant="transparent"
            visibleFrom="sm"
          >
            <IconSeo icon={faUserTie} />
          </Button>
        )}
        <Flex
          align="center"
          justify="center"
          pl={{
            base: 0,
            sm: 24,
          }}
          pos="relative"
          pr={{
            base: 0,
            sm: 24,
          }}
        >
          <Box w={1200}>
            <Flex
              align="center"
              h={90}
              justify="space-between"
              pl={{
                base: isHomePage ? 24 : 80,
                sm: 0,
              }}
              pos="relative"
              style={{
                zIndex: 1,
              }}
              w="100%"
            >
              <Flex align="flex-start" direction="column" justify="flex-start">
                <Link
                  forceCurrentLink
                  to={getLocalizedRoute({
                    route: E_Routes.home,
                  })}
                >
                  <Logo light />
                </Link>
              </Flex>
              <Burger
                aria-label={tSeo("imagesAlt.burgerMenu")}
                color="white"
                hiddenFrom="sm"
                ml={24}
                mr={24}
                onClick={toggle}
                opened={opened}
                size="lg"
              />
              <Box visibleFrom="sm">
                <Collapse opened={!!userCookie}>
                  <Flex
                    align="center"
                    gap={12}
                    justify="flex-end"
                    visibleFrom="sm"
                  >
                    <Button
                      ariaLabel={
                        i18n.language === E_Language.EN.toLowerCase()
                          ? t("navigation.tooltipLanguagePL")
                          : t("navigation.tooltipLanguageEN")
                      }
                      c="white"
                      h={40}
                      onClick={handleChangeLanguage}
                      px={8}
                      tooltip={{
                        label:
                          i18n.language === E_Language.EN.toLowerCase()
                            ? t("navigation.tooltipLanguagePL")
                            : t("navigation.tooltipLanguageEN"),
                      }}
                      variant="subtle"
                    >
                      <IconSeo icon={faLanguage} />
                    </Button>
                    <Button
                      ariaLabel={
                        colorScheme === "dark"
                          ? t("navigation.tooltipLightMode")
                          : t("navigation.tooltipDarkMode")
                      }
                      c="white"
                      h={40}
                      onClick={handleChangeMode}
                      px={8}
                      tooltip={{
                        label:
                          colorScheme === "dark"
                            ? t("navigation.tooltipLightMode")
                            : t("navigation.tooltipDarkMode"),
                      }}
                      variant="subtle"
                    >
                      <IconSeo icon={faCircleHalfStroke} />
                    </Button>
                    <Button
                      ariaLabel={t("navigation.buttonHelp")}
                      c="white"
                      h={40}
                      onClick={handleGoToHelp}
                      px={8}
                      tooltip={{
                        label: t("navigation.tooltipHelp"),
                      }}
                      variant="subtle"
                    >
                      <IconSeo icon={faQuestionCircle} size="xl" />
                    </Button>
                    <Tooltip
                      label={`${userCookie?.userFirstName?.toUpperCase()}${userCookie?.userLastName ? ` ${userCookie?.userLastName?.toUpperCase()}` : ""}`}
                    >
                      <Box pos="relative">
                        <Avatar
                          name={
                            userCookie
                              ? userCookie?.userFirstName
                                  ?.slice(0, 2)
                                  .toUpperCase()
                              : ""
                          }
                          onClick={handleGoToProfile}
                          pointer
                        />
                      </Box>
                    </Tooltip>
                    {userCookie?.userCompanyId && (
                      <Tooltip
                        label={
                          userCookie
                            ? (userCookie?.userCompanyName?.toUpperCase() ?? "")
                            : ""
                        }
                      >
                        <Avatar
                          name={
                            userCookie
                              ? userCookie?.userCompanyName
                                  ?.slice(0, 2)
                                  ?.toUpperCase()
                              : ""
                          }
                          onClick={handleGoToCompanyProfile}
                          pointer
                        />
                      </Tooltip>
                    )}
                    {buttonCreateListing}
                  </Flex>
                </Collapse>
                <Collapse opened={!userCookie}>
                  <Flex
                    align="center"
                    gap={12}
                    justify="flex-end"
                    visibleFrom="sm"
                  >
                    <Button
                      ariaLabel={
                        i18n.language === E_Language.EN.toLowerCase()
                          ? t("navigation.tooltipLanguagePL")
                          : t("navigation.tooltipLanguageEN")
                      }
                      c="white"
                      h={40}
                      onClick={handleChangeLanguage}
                      px={8}
                      tooltip={{
                        label:
                          i18n.language === E_Language.EN.toLowerCase()
                            ? t("navigation.tooltipLanguagePL")
                            : t("navigation.tooltipLanguageEN"),
                      }}
                      variant="subtle"
                    >
                      <IconSeo icon={faLanguage} />
                    </Button>
                    <Button
                      ariaLabel={
                        colorScheme === "dark"
                          ? t("navigation.tooltipLightMode")
                          : t("navigation.tooltipDarkMode")
                      }
                      c="white"
                      h={40}
                      onClick={handleChangeMode}
                      px={8}
                      tooltip={{
                        label:
                          colorScheme === "dark"
                            ? t("navigation.tooltipLightMode")
                            : t("navigation.tooltipDarkMode"),
                      }}
                      variant="subtle"
                    >
                      <IconSeo icon={faCircleHalfStroke} />
                    </Button>
                    <Button
                      ariaLabel={t("navigation.buttonHelp")}
                      c="white"
                      h={40}
                      onClick={handleGoToHelp}
                      px={8}
                      tooltip={{
                        label: t("navigation.tooltipHelp"),
                      }}
                      variant="subtle"
                    >
                      <IconSeo icon={faQuestionCircle} size="xl" />
                    </Button>
                    <Flex gap={2}>
                      <Button
                        color="dark"
                        routeTo={E_Routes.registration}
                        size="sm"
                        style={{
                          borderBottomRightRadius: 0,
                          borderTopRightRadius: 0,
                        }}
                        variant="white"
                        w="auto"
                      >
                        {t("navigation.buttonRegistration")}
                      </Button>
                      <Button
                        color="dark"
                        routeTo={E_Routes.login}
                        size="sm"
                        style={{
                          borderBottomLeftRadius: 0,
                          borderTopLeftRadius: 0,
                        }}
                        variant="white"
                        w="auto"
                      >
                        {t("navigation.buttonLogin")}
                      </Button>
                    </Flex>
                    {buttonCreateListing}
                  </Flex>
                </Collapse>
              </Box>
            </Flex>
          </Box>
        </Flex>
        <Box
          hiddenFrom="sm"
          left={0}
          pos="absolute"
          style={{
            opacity: isHomePage ? 0 : 0.4,
            transition: "opacity 0.3s ease",
            zIndex: 1,
          }}
          top={25}
        >
          <Button
            ariaLabel={tSeo("imagesAlt.previous")}
            variant="subtle"
            w={80}
          >
            <IconSeo color="white" icon={faArrowLeft} size="2x" />
          </Button>
        </Box>
        <Flex
          align="center"
          bg={colorsMantine.dark9}
          className="center"
          component="div"
          gap={8}
          h={isOtpCodeDisabled || isEmailDisabled || isSMSDisabled ? 12 : 0}
          justify="center"
          left={0}
          pos="absolute"
          right={0}
          style={{
            overflow: "hidden",
            transitionDelay: "1s",
            transitionDuration: "0.2s",
            transitionProperty: "height",
            transitionTimingFunction: "ease",
            zIndex: 1001,
          }}
          top={0}
          w="100%"
        >
          {isOtpCodeDisabled && (
            <Text c="gray.0" display="inline" fw="bold" size="10px">
              {t("flags.testOtpCode")}
            </Text>
          )}
          {isEmailDisabled && (
            <Text c="gray.0" display="inline" fw="bold" size="10px">
              {t("flags.testEMAIL")}
            </Text>
          )}
          {isSMSDisabled && (
            <Text c="gray.0" display="inline" fw="bold" size="10px">
              {t("flags.testSMS")}
            </Text>
          )}
        </Flex>
      </Box>
    </>
  );
};

export const Navigation = memo(NavigationToMemoize);

import { Box } from "@mantine/core";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUserCookie } from "~/hooks/useUserCookie";
import { E_Roles } from "~/models/enums";
import { Button } from "~/ui/Button";

export const BottomMenu = () => {
  const { t } = useTranslation(namespaces.common);

  const { userCookie } = useUserCookie();
  const location = useLocation();
  const navigate = useNavigate();
  const { getLocalizedRoute } = useLocalizedRoute();

  const isHomePage =
    location.pathname === getLocalizedRoute({ route: E_Routes.home });

  const handleGoToListingsNew = useCallback(() => {
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

  const disabledButtonNew = userCookie
    ? !!userCookie?.userRole?.includes(E_Roles.ADMIN)
    : true;

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

  if (userCookie?.userRole?.includes(E_Roles.ADMIN)) {
    return null;
  }

  return (
    <Box
      bottom={0}
      hiddenFrom="sm"
      left={0}
      pos="fixed"
      right={0}
      style={{
        transform: isHomePage ? "translateY(0)" : "translateY(100%)",
        zIndex: 1000,
      }}
    >
      <Button
        fullWidth
        onClick={handleGoToListingsNew}
        routeTo={routeTo}
        size="md"
        style={{
          borderRadius: 0,
        }}
        tooltip={{
          label: tooltipLabel,
        }}
        variant="gradient"
      >
        {userCookie?.userCompanyId
          ? t("navigation.addListingCompany")
          : t("navigation.addListing")}
      </Button>
    </Box>
  );
};

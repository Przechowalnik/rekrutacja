import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Box, Breadcrumbs as MantineBreadcrumbs } from "@mantine/core";
import { Fragment, memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { idKey } from "~/constants/queryAndHashes";
import type { T_RouteName, T_RouteValue } from "~/constants/routes";
import { E_Routes } from "~/constants/routes";
import { globalClasses } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";

import { Button } from "../Button";
import { IconSeo } from "../IconSeo";
import { Link } from "../Link";
import { Text } from "../Text";

export type T_BreadcrumbsRoute =
  | {
      customHref?: string;
      customTitle?: string;
      goBack?: boolean;
      route?: T_RouteName;
    }
  | T_RouteName;

type T_Breadcrumbs = {
  routes: T_BreadcrumbsRoute[];
};

const BreadcrumbsToMemoize = ({ routes = [] }: T_Breadcrumbs) => {
  const [showButtonMobile, setShowButtonMobile] = useState(false);

  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const navigate = useNavigate();
  const { platformColor } = useLayout();
  const { getLocalizedRoute } = useLocalizedRoute();

  let linkBackOnMobile: null | T_RouteName = null;
  let linkBackOnMobileGoBack = false;
  let linkBackOnMobileCustomHref: null | string = null;
  if (routes.length >= 2) {
    const selectedBreadcrumb = routes.at(-2);
    if (selectedBreadcrumb) {
      if (typeof selectedBreadcrumb === "string") {
        linkBackOnMobile = selectedBreadcrumb;
      } else if (selectedBreadcrumb.route) {
        linkBackOnMobile = selectedBreadcrumb.route;
        linkBackOnMobileGoBack = !!selectedBreadcrumb.goBack;
      } else if (selectedBreadcrumb.customHref) {
        linkBackOnMobileCustomHref = selectedBreadcrumb.customHref;
      }
    }
  }

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowButtonMobile(true);

      const timer2 = setTimeout(() => {
        setShowButtonMobile(true);
      }, 200);

      return () => clearTimeout(timer2);
    }, 400);

    return () => clearTimeout(timer1);
  }, [routes]);

  const handleGoBack = useCallback((otherLink: T_RouteValue) => {
    if (globalThis.history.length > 2) {
      navigate(-1);
    } else {
      navigate(otherLink);
    }
  }, []);

  const handleGoBackMobile = () => {
    if (globalThis.history.length > 2) {
      navigate(-1);
    } else if (linkBackOnMobileCustomHref) {
      navigate(linkBackOnMobileCustomHref);
    } else if (linkBackOnMobile) {
      navigate(
        getLocalizedRoute({
          route: linkBackOnMobile,
        }),
      );
    }
  };

  const mapBreadcrumbs = routes.map((itemRoute, indexRoute) => {
    const isTypeRoute = typeof itemRoute === "string";
    let title = "";
    let linkTo = getLocalizedRoute({
      route: E_Routes.home,
    });

    if (isTypeRoute) {
      title = t(`breadcrumbs.${itemRoute}`);
      linkTo = getLocalizedRoute({
        route: itemRoute,
      });
    } else {
      if (typeof itemRoute.customTitle === "string") {
        title = itemRoute.customTitle;
      } else if (itemRoute.route) {
        title = t(`breadcrumbs.${itemRoute.route}`);
      }

      if (itemRoute.customHref) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkTo = itemRoute.customHref as any;
      } else if (itemRoute.route) {
        linkTo = getLocalizedRoute({
          route: itemRoute.route,
        });
      }
    }

    const normalLink = (
      <Link
        disabled={indexRoute === routes.length - 1}
        id={idKey.skipFocus}
        onDisabledWithUnderline
        to={linkTo}
        withUnderline
      >
        <Text fw="bold">{title}</Text>
      </Link>
    );

    let content = normalLink;
    if (typeof itemRoute !== "string" && itemRoute.goBack) {
      content = (
        <Button
          id={idKey.skipFocus}
          onClick={() => handleGoBack(linkTo)}
          p={0}
          variant="transparent"
          withAnimation={false}
        >
          <Text c={platformColor} fw="bold" underline>
            {title}
          </Text>
        </Button>
      );
    }

    return (
      <Fragment key={`breadcrumb__${title}_${indexRoute}`}>{content}</Fragment>
    );
  });

  return (
    <>
      <MantineBreadcrumbs
        id={idKey.skipFocus}
        separator="/"
        separatorMargin={10}
        visibleFrom="xs"
        w="100%"
      >
        {mapBreadcrumbs}
      </MantineBreadcrumbs>
      {(linkBackOnMobile || linkBackOnMobileCustomHref) && showButtonMobile && (
        <Box
          className={globalClasses.showAfterFadePage}
          hiddenFrom="xs"
          left={0}
          pos="fixed"
          style={{
            zIndex: 1000,
          }}
          top={25}
        >
          {linkBackOnMobile && !linkBackOnMobileGoBack && (
            <Button
              ariaLabel={tSeo("imagesAlt.previous")}
              id={idKey.skipFocus}
              routeTo={linkBackOnMobile}
              variant="subtle"
              w={80}
            >
              <IconSeo color="white" icon={faArrowLeft} size="2x" />
            </Button>
          )}
          {linkBackOnMobileCustomHref && !linkBackOnMobileGoBack && (
            <Link
              id={idKey.skipFocus}
              target="_self"
              to={linkBackOnMobileCustomHref as T_RouteValue}
            >
              <Button
                ariaLabel={tSeo("imagesAlt.previous")}
                id={idKey.skipFocus}
                variant="subtle"
                w={80}
              >
                <IconSeo color="white" icon={faArrowLeft} size="2x" />
              </Button>
            </Link>
          )}
          {linkBackOnMobileGoBack && (
            <Button
              ariaLabel={tSeo("imagesAlt.previous")}
              id={idKey.skipFocus}
              onClick={handleGoBackMobile}
              variant="subtle"
              w={80}
            >
              <IconSeo color="white" icon={faArrowLeft} size="2x" />
            </Button>
          )}
        </Box>
      )}
    </>
  );
};

export const Breadcrumbs = memo(BreadcrumbsToMemoize);

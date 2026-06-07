/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { BoxProps, MantineSize } from "@mantine/core";
import { Box, Text } from "@mantine/core";
import cx from "clsx";
import type { HTMLAttributeAnchorTarget, PropsWithChildren } from "react";
import { memo, useCallback } from "react";
import { Link as ReactRouterLink, useLocation } from "react-router";

import type { T_RouteValue } from "~/constants/routes";

type LinkToValue =
  | { hash?: string; pathname?: T_RouteValue; search?: string }
  | T_RouteValue;

type T_Link = BoxProps & {
  ariaLabel?: string;
  customHref?: string;
  disabled?: boolean;
  download?: boolean;
  forceCurrentLink?: boolean;
  fullWidth?: boolean;
  fullWidthOnMobile?: boolean;
  id?: string;
  onClick?: () => void;
  onDisabledWithUnderline?: boolean;
  rel?: string;
  reloadDocument?: boolean;
  size?: MantineSize;
  target?: HTMLAttributeAnchorTarget;
  text?: boolean;
  to?: LinkToValue;
  withUnderline?: boolean;
};

const Link = ({
  ariaLabel,
  children,
  className,
  customHref,
  disabled,
  download,
  forceCurrentLink,
  fullWidth,
  fullWidthOnMobile,
  fw,
  id,
  onClick,
  onDisabledWithUnderline = false,
  reloadDocument,
  size,
  target,
  text,
  to,
  withUnderline,
  ...restProps
}: PropsWithChildren<T_Link>) => {
  const location = useLocation();

  const handleAddScrollPositionToHistory = useCallback(() => {
    sessionStorage.setItem(location.pathname, window.scrollY.toString());
    onClick?.();
  }, [location.pathname, to]);

  const handleScrollToUp = useCallback(() => {
    if (disabled) {
      return;
    }

    window.scrollTo({
      behavior: "smooth",
      top: 0,
    });
  }, [disabled]);

  const disabledComponent =
    text || typeof children === "string" ? (
      <Box
        className={cx(className, fullWidthOnMobile && "maxWidthOnMobile")}
        id={id}
        onClick={handleScrollToUp}
        style={{
          cursor: disabled ? "no-drop" : "pointer",
        }}
        w={fullWidth ? "100%" : undefined}
      >
        <Text
          {...restProps}
          fw={fw}
          size={size}
          styles={{
            root: {
              cursor: "no-drop",
              ...(onDisabledWithUnderline
                ? { textDecoration: "underline" }
                : {}),
            },
          }}
        >
          {children}
        </Text>
      </Box>
    ) : (
      // @ts-ignore
      <Box
        {...restProps}
        className={cx(className, fullWidthOnMobile && "maxWidthOnMobile")}
        id={id}
        onClick={handleScrollToUp}
        style={{
          cursor: disabled ? "no-drop" : "pointer",
        }}
        w={fullWidth ? "100%" : undefined}
      >
        {children}
      </Box>
    );

  if (!forceCurrentLink) {
    if (typeof to === "string" || customHref) {
      if (location.pathname === (to ?? customHref)) {
        return disabledComponent;
      }
    } else if (location.pathname === to?.pathname) {
      return disabledComponent;
    }
  }

  if (disabled) {
    return disabledComponent;
  }

  const linkColor = (() => {
    if (!restProps.c || typeof restProps.c !== "string") {
      return;
    }
    if (restProps.c.includes("var")) {
      return restProps.c;
    }
    return `var(--mantine-color-${restProps.c}-filled)`;
  })();

  return (
    <ReactRouterLink
      aria-label={ariaLabel}
      className={cx(className, fullWidthOnMobile && "maxWidthOnMobile")}
      discover="none"
      download={download}
      id={id}
      onClick={handleAddScrollPositionToHistory}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      reloadDocument={reloadDocument}
      //@ts-ignore
      style={{
        ...(linkColor ? { color: linkColor } : {}),
        ...(fullWidth ? { width: "100%" } : {}),
        ...(withUnderline
          ? {
              fontWeight: "bold",
              textDecoration: "underline",
            }
          : {}),
      }}
      target={target}
      //@ts-ignore
      to={to ?? (customHref as unknown)}
    >
      {text || typeof children === "string" ? (
        <Text {...restProps} component="span" fw={fw} size={size}>
          {children}
        </Text>
      ) : (
        // @ts-ignore
        <Box {...restProps}>{children}</Box>
      )}
    </ReactRouterLink>
  );
};

export default memo(Link);

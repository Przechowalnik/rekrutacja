/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  BoxProps,
  ButtonVariant,
  DefaultMantineColor,
  FloatingPosition,
  MantineRadius,
  MantineSize,
  StyleProp,
} from "@mantine/core";
import { Button as MantineButton } from "@mantine/core";
import cx from "clsx";
import type { Property } from "csstype";
import type { MouseEvent, PropsWithChildren, ReactNode } from "react";
import { memo, useEffect, useRef, useState } from "react";
import { Link as ReactRouterLink } from "react-router";

import { colorsMantine } from "~/constants/colorsMantine";
import { type T_RouteName } from "~/constants/routes";
import { globalClasses } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";

import { Tooltip } from "../Tooltip";
import { buttonLineHeight, generateButtonGradient } from "./utilities";

export type T_ButtonTooltip = {
  fontWeightBold?: boolean;
  forceOpen?: boolean;
  label: string;
  position?: FloatingPosition;
  withTextDecoration?: boolean;
};

export type T_Button = {
  ariaLabel?: string;
  clickable?: boolean;
  color?: "black" | "lightGray" | DefaultMantineColor;
  component?: "button" | "div";
  disabled?: boolean;
  display?: StyleProp<Property.Display>;
  fullWidth?: boolean;
  id?: string;
  justify?: "center" | "flex-start" | "space-between";
  leftSection?: ReactNode;
  link?: string;
  loading?: boolean;
  onBlur?: (event: MouseEvent<HTMLButtonElement>) => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onMouseDown?: (event: MouseEvent<HTMLButtonElement>) => void;
  radius?: MantineRadius;
  rightSection?: ReactNode;
  role?: string;
  routeTo?: T_RouteName;
  size?: MantineSize;
  tabIndex?: number;
  tooltip?: T_ButtonTooltip;
  tooltipOnlyOnDisabled?: boolean;
  type?: "button" | "reset" | "submit";
  variant?: ButtonVariant;
  withAnimation?: boolean;
} & BoxProps;

const ButtonToMemoize = ({
  ariaLabel,
  children,
  className,
  clickable = true,
  color,
  component = "button",
  disabled,
  display,
  fullWidth = false,
  id,
  justify = "center",
  leftSection,
  link,
  loading = false,
  maw,
  onBlur,
  onClick,
  onMouseDown,
  radius,
  rightSection,
  role,
  routeTo,
  size = "md",
  tabIndex,
  tooltip,
  tooltipOnlyOnDisabled = true,
  type = "button",
  variant = "gradient",
  withAnimation = true,
  ...restProps
}: PropsWithChildren<T_Button>) => {
  const [disabledTooltip, setDisabledTooltip] = useState(false);
  const timerReference = useRef<NodeJS.Timeout>(null);
  const { getLocalizedRoute } = useLocalizedRoute();
  const { isBrowserDevice, platformColor } = useLayout();

  const generatedGradient =
    variant === "gradient"
      ? generateButtonGradient({ platformColor: color ?? platformColor })
      : undefined;

  const validShowTooltip = tooltipOnlyOnDisabled ? disabled : true;
  const validDisabledTooltip = !validShowTooltip || disabledTooltip;

  useEffect(() => {
    const shouldEnableTooltip =
      (tooltipOnlyOnDisabled && disabled) || isBrowserDevice;
    setDisabledTooltip(!shouldEnableTooltip);
  }, [disabled, tooltipOnlyOnDisabled, isBrowserDevice]);

  useEffect(() => {
    if (!ariaLabel && typeof children !== "string") {
      console.warn("No aria label in Button", children);
    }
  }, [ariaLabel]);

  const handleClickButton = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    onClick?.(event);

    setDisabledTooltip(true);
    if (timerReference.current) {
      clearTimeout(timerReference.current);
    }
    timerReference.current = globalThis.setTimeout(() => {
      setDisabledTooltip(false);
    }, 600);
  };

  const colorProps = (() => {
    if (color === "black") {
      return {
        bg: disabled
          ? `light-dark(${colorsMantine.dark5}, ${colorsMantine.gray2})`
          : `light-dark(${colorsMantine.black}, ${colorsMantine.white})`,
        c: disabled
          ? `light-dark(${colorsMantine.gray5}, ${colorsMantine.dark1})`
          : `light-dark(${colorsMantine.white}, ${colorsMantine.black})`,
        color: "dark",
      };
    }

    if (color === "lightGray") {
      return {
        bg: `light-dark(${colorsMantine.gray0}, ${colorsMantine.dark6})`,
        c: disabled
          ? `light-dark(${colorsMantine.gray5}, ${colorsMantine.dark1})`
          : `light-dark(${colorsMantine.black}, ${colorsMantine.white})`,
        color: "dark",
      };
    }

    return {
      color: color ?? platformColor,
    };
  })();

  const to = (() => {
    if (disabled) {
      return;
    }

    if (routeTo) {
      return getLocalizedRoute({
        route: routeTo,
      });
    }

    if (link) {
      return link;
    }

    return;
  })();

  const button = (
    <MantineButton
      {...restProps}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      className={cx(
        clickable && withAnimation && globalClasses.buttonContent,
        variant === "gradient" && globalClasses.buttonContentGradient,
        className,
      )}
      id={id}
      maw={maw}
      role={role}
      tabIndex={tabIndex}
      {...colorProps}
      component={
        (link || routeTo) && !disabled ? ReactRouterLink : (component as any)
      }
      disabled={disabled}
      display={display}
      fullWidth={fullWidth}
      gradient={generatedGradient}
      justify={justify}
      leftSection={leftSection || undefined}
      loading={loading}
      onBlur={onBlur}
      onClick={handleClickButton}
      onMouseDown={onMouseDown}
      radius={radius}
      rightSection={rightSection || undefined}
      size={size}
      style={{
        borderRadius: 12,
        ...(color === "lightGray"
          ? {
              border: `1px solid light-dark(${
                disabled ? colorsMantine.gray4 : colorsMantine.gray7
              }, ${disabled ? colorsMantine.dark2 : colorsMantine.gray4})`,
            }
          : {}),
        ...(variant === "gradient"
          ? {
              borderWidth: 0,
            }
          : {}),
        ...(clickable
          ? {}
          : {
              cursor: "default",
            }),
        ...(disabled
          ? {
              cursor: "no-drop",
              pointerEvents: "none",
              transform: "none",
            }
          : {}),
        ...restProps.style,
      }}
      styles={{
        label: {
          lineHeight: buttonLineHeight[size],
          whiteSpace: "normal",
        },
      }}
      to={to}
      type={type}
      variant={variant}
      w={
        fullWidth
          ? "100%"
          : (restProps.w ?? {
              base: "100%",
              xs: "auto",
            })
      }
    >
      {children}
    </MantineButton>
  );

  return tooltip ? (
    <Tooltip
      disabled={validDisabledTooltip}
      fullWidth={fullWidth}
      key={validDisabledTooltip.toString()}
      maw={maw}
      w={
        fullWidth
          ? "100%"
          : (restProps.w ?? {
              base: "100%",
              xs: "auto",
            })
      }
      {...tooltip}
    >
      {button}
    </Tooltip>
  ) : (
    button
  );
};

export const Button = memo(ButtonToMemoize);

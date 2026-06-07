/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { BoxProps, MantineFontSize, TextProps } from "@mantine/core";
import { Text as MantineText } from "@mantine/core";
import type { PropsWithChildren, RefObject } from "react";
import { memo } from "react";

import { globalClasses } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { replaceTextToUi } from "~/utilities/converter";
import { safeHtml } from "~/utilities/functions";

import { generateTextGradient } from "./utilities";

export type T_TextComponent =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span";

export type T_Text = TextProps &
  BoxProps & {
    center?: boolean;
    className?: string;
    component?: T_TextComponent;
    id?: string;
    inherit?: boolean;
    primaryColor?: boolean;
    refText?: RefObject<HTMLDivElement | null>;
    size?:
      | "h1"
      | "h2"
      | "h3"
      | "h4"
      | "h5"
      | "h6"
      | "lg"
      | "md"
      | "sm"
      | "xl"
      | "xs"
      | MantineFontSize;
    span?: boolean;
    textRight?: boolean;
    underline?: boolean;
    withHTML?: boolean;
    withTextsToUi?: boolean;
  };

const TextToMemoize = ({
  c,
  center,
  children,
  className,
  component,
  display = "block",
  fw,
  id,
  inherit,
  lineClamp,
  primaryColor,
  refText,
  size,
  span,
  style,
  textRight,
  underline = false,
  variant = "text",
  withHTML,
  withTextsToUi,
  ...restProps
}: PropsWithChildren<T_Text>) => {
  const { platformColor } = useLayout();
  const { getLocalizedRoute } = useLocalizedRoute();

  const generatedGradient =
    variant === "gradient"
      ? generateTextGradient({ platformColor })
      : undefined;

  const childrenStringOrUndefined =
    typeof children === "string" ? children : undefined;

  const htmlToClear = withTextsToUi
    ? replaceTextToUi({
        getLocalizedRoute,
        htmlString: childrenStringOrUndefined ?? "",
        // @ts-ignore
        size: typeof size === "string" ? size : "md",
      })
    : childrenStringOrUndefined;

  const clear = safeHtml({
    element: typeof htmlToClear === "string" ? htmlToClear : "",
  });

  const align = (() => {
    if (center) {
      return "center";
    }
    if (textRight) {
      return "right";
    }
    return;
  })();

  let renderedChildren: React.ReactNode = children;
  if (!withHTML && withTextsToUi) {
    const childrenString = typeof children === "string" ? children : "";
    renderedChildren = replaceTextToUi({
      c,
      getLocalizedRoute,
      htmlString: childrenString,
      // @ts-ignore
      size: typeof size === "string" ? size : "md",
    });
  } else if (withHTML) {
    renderedChildren = undefined;
  }

  return (
    <MantineText
      ref={refText}
      {...restProps}
      align={align}
      c={primaryColor ? platformColor : c}
      component={component}
      fw={fw}
      id={id}
      // @ts-ignore
      key={children}
      {...(withHTML
        ? {
            dangerouslySetInnerHTML: {
              __html: clear,
            },
          }
        : {})}
      className={
        lineClamp ? `${globalClasses.singleLine} ${className}` : className
      }
      display={display}
      gradient={generatedGradient}
      inherit={inherit}
      lineClamp={lineClamp}
      size={(() => {
        if (size != null) {
          return size;
        }
        if (component?.includes("h")) {
          return component;
        }
        return "md";
      })()}
      span={span}
      style={{
        ...(underline && { textDecoration: "underline" }),
        ...(component?.includes("h") && {}),
        ...(variant === "gradient"
          ? {
              animation: "gradient 3s ease infinite",
              backgroundSize: "500%",
            }
          : {}),
        ...style,
      }}
      variant={variant}
    >
      {renderedChildren}
    </MantineText>
  );
};

export const Text = memo(TextToMemoize);

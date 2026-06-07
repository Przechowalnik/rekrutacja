/* eslint-disable @typescript-eslint/ban-ts-comment */

import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { DefaultMantineColor, StyleProp } from "@mantine/core";
import type { DOMNode, Element } from "html-react-parser";
import parse, { domToReact } from "html-react-parser";
import type { JSX } from "react";

import { colorsMantine } from "~/constants/colorsMantine";
import { type T_RouteName } from "~/constants/routes";
import { T_GetLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { IconSeo } from "~/ui/IconSeo";
import { Link } from "~/ui/Link";
import { Mark } from "~/ui/Mark";
import { Text } from "~/ui/Text";
import { Tooltip } from "~/ui/Tooltip";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const setObjectFromPath = <T extends Record<string, any>>(
  object: T,
  path: string,
  value: any,
): T => {
  // eslint-disable-next-line unicorn/no-array-reduce
  return path.split(".").reduce(
    (o, p, index) =>
      // @ts-ignore
      (o[p] = path.split(".").length === ++index ? value : o[p] || {}),
    object,
  );
};

export function serializeBigInt<T>(object: T): T {
  const serialized = JSON.stringify(object, (_, value) =>
    typeof value === "bigint" ? Number(value) : value,
  );
  return JSON.parse(serialized) as T;
}

const isAnchorTag = (node: DOMNode): node is Element => {
  return node.type === "tag" && node.name === "a" && !!node.attribs?.href;
};

const isTooltipTag = (node: DOMNode): node is Element => {
  return (
    node.type === "tag" && node.name === "tooltip" && !!node.attribs?.label
  );
};

const isMarkTag = (node: DOMNode): node is Element => {
  return node.type === "tag" && node.name === "mark";
};

const isGradientTag = (node: DOMNode): node is Element => {
  return node.type === "tag" && node.name === "gradient";
};

const isPrimaryTag = (node: DOMNode): node is Element => {
  return node.type === "tag" && node.name === "primary";
};

const isColorTag = (node: DOMNode): node is Element => {
  return node.type === "tag" && node.name === "color";
};

const isTooltipIconTag = (node: DOMNode): node is Element => {
  return (
    node.type === "tag" && node.name === "tooltipicon" && !!node.attribs?.label
  );
};

type T_TextSize = "lg" | "md" | "sm" | "xl" | "xs";

export const replaceTextToUi = ({
  c,
  getLocalizedRoute,
  htmlString,
  size,
}: {
  c: StyleProp<DefaultMantineColor> | undefined;
  getLocalizedRoute: T_GetLocalizedRoute;
  htmlString: string;
  size?: T_TextSize;
}): JSX.Element | JSX.Element[] | string => {
  return parse(htmlString, {
    replace: (domNode: DOMNode) => {
      if (isAnchorTag(domNode)) {
        const { custom, href, target } = domNode.attribs;

        const isCustomLink = custom === "true";

        return (
          <Link
            c={c}
            customHref={isCustomLink ? href : undefined}
            onDisabledWithUnderline
            rel="noreferrer"
            target={target === "_blank" ? target : undefined}
            text
            to={
              isCustomLink
                ? undefined
                : getLocalizedRoute({
                    route: href as T_RouteName,
                  })
            }
            withUnderline
          >
            {domToReact(domNode.children as DOMNode[])}
          </Link>
        );
      } else if (isTooltipTag(domNode)) {
        // @ts-ignore
        const label = domNode.attribs?.label ?? "";

        return (
          <Tooltip label={label} withTextDecoration>
            <Text
              display="inline"
              fw="bold"
              primaryColor
              size={size}
              span
              underline
            >
              {
                // @ts-ignore
                domToReact(domNode.children as DOMNode[])
              }
            </Text>
          </Tooltip>
        );
      } else if (isMarkTag(domNode)) {
        return (
          <Mark>
            {
              // @ts-ignore
              domToReact(domNode.children as DOMNode[])
            }
          </Mark>
        );
      } else if (isGradientTag(domNode)) {
        return (
          <Text display="inline" fw="bold" size={size} span variant="gradient">
            {
              // @ts-ignore
              domToReact(domNode.children as DOMNode[])
            }
          </Text>
        );
      } else if (isPrimaryTag(domNode)) {
        return (
          <Text
            c="violet"
            display="inline"
            fw="bold"
            size={size}
            span
            variant="text"
          >
            {
              // @ts-ignore
              domToReact(domNode.children as DOMNode[])
            }
          </Text>
        );
      } else if (isColorTag(domNode)) {
        // @ts-ignore
        const color = domNode.attribs?.color ?? "";
        return (
          <Text c={color} display="inline" size={size} span variant="text">
            {
              // @ts-ignore
              domToReact(domNode.children as DOMNode[])
            }
          </Text>
        );
      } else if (isTooltipIconTag(domNode)) {
        // @ts-ignore
        const label = domNode.attribs?.label ?? "";

        return (
          <>
            <Text
              display="inline"
              fw="bold"
              primaryColor
              size={size}
              span
              variant="text"
            >
              {
                // @ts-ignore
                domToReact(domNode.children as DOMNode[])
              }
            </Text>{" "}
            <Tooltip label={label} w="auto" withTextDecoration>
              <IconSeo
                color={colorsMantine.primary}
                icon={faCircleQuestion}
                size="lg"
              />
            </Tooltip>
          </>
        );
      }
    },
  });
};

export function hidePhoneNumbers({
  replaceText,
  text,
}: {
  replaceText: string;
  text: string;
}) {
  const phoneRegex = /\b(?:\d[ ._-]?){8}\d\b/g;
  return text.replaceAll(phoneRegex, replaceText);
}

import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import type {
  BoxProps,
  ButtonVariant,
  CSSProperties,
  MantineColor,
  StyleProp,
} from "@mantine/core";
import {
  Box,
  Card as CardMantine,
  Flex,
  useMantineColorScheme,
} from "@mantine/core";
import cx from "clsx";
import type { MouseEvent, PropsWithChildren, ReactNode } from "react";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import type { T_RouteName, T_RouteValue } from "~/constants/routes";
import { globalClasses } from "~/constants/styles";

import { Badge } from "../Badge";
import { Button } from "../Button";
import { Collapse } from "../Collapse";
import { IconSeo } from "../IconSeo";
import { Link } from "../Link";
import { Text } from "../Text";
import { Tooltip } from "../Tooltip";
import classes from "./card.module.css";

export type T_CardBadge = {
  color: MantineColor;
  label: string;
  tooltip?: string;
};

export type T_CardButton = {
  color?: MantineColor;
  disabled?: boolean;
  label: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  routeTo?: T_RouteName;
  type?: "button" | "reset" | "submit";
  variant?: ButtonVariant;
};

type T_Card = {
  badges?: T_CardBadge[];
  className?: string;
  color?: "blue" | "gray" | "green" | "primary" | "red";
  contentShowMore?: ReactNode;
  cursorPointer?: boolean;
  customButtonLabel?: string;
  customButtons?: T_CardButton[];
  href?: T_RouteValue;
  isEditable?: boolean;
  minHeight?: StyleProp<CSSProperties["minHeight"]>;
  title?: ReactNode | string;
  titleLineClamp?: number;
  width?: StyleProp<CSSProperties["width"]>;
  withOpacityEffect?: boolean;
} & BoxProps;

const CardToMemoize = ({
  badges = [],
  children,
  className,
  color = "primary",
  contentShowMore,
  cursorPointer,
  customButtonLabel,
  customButtons,
  href,
  isEditable = false,
  minHeight,
  opacity,
  title,
  titleLineClamp,
  width = "400px",
  withOpacityEffect = false,
  ...restProps
}: PropsWithChildren<T_Card>) => {
  const [isShowMore, setIsShowMore] = useState(false);

  const { t } = useTranslation(namespaces.common);
  const { colorScheme } = useMantineColorScheme();

  const withLink = !(!isEditable || !href);

  const handleOnShowMore = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setIsShowMore(previousState => !previousState);
    },
    [],
  );

  const mapBadges = badges.map(item => {
    const badgeContent = (
      <Badge
        color={item.color}
        key={`badge_${item.label}`}
        radius="md"
        size="sm"
      >
        {item.label}
      </Badge>
    );

    if (!item.tooltip) {
      return badgeContent;
    }

    return (
      <Tooltip key={`tooltipBadge_${item.label}`} label={item.tooltip} w="auto">
        {badgeContent}
      </Tooltip>
    );
  });

  const mapCustomButtons = customButtons?.map(item => {
    return (
      <Button
        key={`customButton_${item.label}`}
        {...item}
        color="dark"
        size="xs"
        variant="white"
      >
        {item.label}
      </Button>
    );
  });

  const contentHeader = (
    <Box
      bg={
        color === "primary"
          ? `light-dark(${colorsMantine.primary8}, ${colorsMantine.primary7})`
          : `light-dark(var(--mantine-color-${color}-8), var(--mantine-color-${color}-7))`
      }
      className={cx({ "shadow-inset2": colorScheme === "light" })}
      pb="xs"
      px="xs"
      w="100%"
    >
      {badges.length > 0 && (
        <Flex
          align="center"
          gap={8}
          justify="flex-end"
          p={8}
          pb="xs"
          pr={0}
          w="100%"
        >
          {mapBadges}
        </Flex>
      )}
      {typeof title === "string" && (
        <Text
          c="white"
          center
          fw="bold"
          lineClamp={titleLineClamp}
          pt={badges.length > 0 ? 0 : "xs"}
          size="xl"
        >
          {title}
        </Text>
      )}
      {typeof title !== "string" && <Box p="xs">{title}</Box>}
    </Box>
  );

  const contentFooter = (
    <>
      {isEditable && href && !customButtons && (
        <Flex
          align="center"
          bg={
            color === "primary"
              ? `light-dark(${colorsMantine.primary7}, ${colorsMantine.primary7})`
              : `light-dark(var(--mantine-color-${color}-8), var(--mantine-color-${color}-7))`
          }
          className={cx({ "shadow-inset": colorScheme === "light" })}
          justify="flex-end"
          p="sm"
          w="100%"
        >
          <Button color="dark" size="xs" variant="white">
            {customButtonLabel ?? t("buttonEdit")}
          </Button>
        </Flex>
      )}
      {customButtons && (
        <Flex
          align="center"
          bg={
            color === "primary"
              ? `light-dark(${colorsMantine.primary7}, ${colorsMantine.primary7})`
              : `light-dark(var(--mantine-color-${color}-8), var(--mantine-color-${color}-7))`
          }
          className={cx({ "shadow-inset": colorScheme === "light" })}
          gap={8}
          justify="flex-end"
          p="sm"
          w="100%"
        >
          {mapCustomButtons}
        </Flex>
      )}
    </>
  );

  const contentChildren = (
    <Flex
      align="flex-start"
      className={globalClasses.flexGrow1}
      direction="column"
      gap={16}
      justify="flex-start"
      px="lg"
      py="md"
    >
      {children}
    </Flex>
  );

  const allContentShowMore = (
    <Flex
      align="flex-start"
      direction="column"
      gap={16}
      justify="flex-start"
      pb={16}
      px="lg"
    >
      {contentShowMore}
    </Flex>
  );

  const content = (
    <CardMantine
      bg={
        color === "primary"
          ? `light-dark(${colorsMantine.primary6}, ${colorsMantine.primary9})`
          : `light-dark(var(--mantine-color-${color}-7), var(--mantine-color-${color}-9))`
      }
      className={cx(
        className,

        ((isEditable && href && !customButtons) || cursorPointer) &&
          classes.cardUserSelect,
        withOpacityEffect && globalClasses.opacityDelay,
      )}
      padding={0}
      radius="md"
      shadow="sm"
      withBorder
    >
      <Flex
        align="flex-start"
        direction="column"
        h="100%"
        justify="space-between"
        mih={minHeight}
        w="100%"
      >
        <Flex
          align="flex-start"
          className={globalClasses.flexGrow1}
          direction="column"
          display="flex"
          justify="flex-start"
          w="100%"
        >
          {withLink && (
            <Link fullWidth to={href}>
              {contentHeader}
            </Link>
          )}
          {!withLink && contentHeader}
          {withLink && (
            <Link className={globalClasses.flexGrow1} fullWidth to={href}>
              {contentChildren}
            </Link>
          )}
          {!withLink && contentChildren}
          {contentShowMore && (
            <>
              <Collapse opened={isShowMore}>
                {withLink && (
                  <Link fullWidth to={href}>
                    {allContentShowMore}
                  </Link>
                )}
                {!withLink && allContentShowMore}
              </Collapse>
              <Button
                color="white"
                onClick={handleOnShowMore}
                rightSection={
                  <IconSeo
                    icon={faChevronUp}
                    rotation={isShowMore ? undefined : 180}
                    size="lg"
                  />
                }
                size="xs"
                variant="subtle"
                w="100%"
              >
                {isShowMore
                  ? t("card.buttonShowLess")
                  : t("card.buttonShowMore")}
              </Button>
            </>
          )}
        </Flex>
        {withLink && (
          <Link fullWidth to={href}>
            {contentFooter}
          </Link>
        )}
        {!withLink && contentFooter}
      </Flex>
    </CardMantine>
  );

  return (
    <Box
      {...restProps}
      maw="100%"
      mih={minHeight}
      miw={300}
      opacity={opacity}
      w={width}
    >
      {content}
    </Box>
  );
};

export const Card = memo(CardToMemoize);

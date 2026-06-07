import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { MantineRadius, MantineSize } from "@mantine/core";
import { Avatar as AvatarMantine, Flex } from "@mantine/core";
import { memo } from "react";

import { colorsMantine } from "~/constants/colorsMantine";
import { useLayout } from "~/hooks/useLayout";

import { IconSeo } from "../IconSeo";

const AvatarToMemoize = ({
  color = "dark",
  customIcon,
  name,
  onClick,
  pointer = false,
  radius = 60,
  size = "md",
  url,
  variant = "white",
  withBorder = true,
  withBorderPrimary = true,
}: {
  color?: "dark" | "gray";
  customIcon?: IconDefinition;
  name?: string;
  onClick?: () => void;
  pointer?: boolean;
  radius?: MantineRadius;
  size?: MantineSize | number | (string & {}); // NOSONAR
  url?: string;
  variant?: "default" | "filled" | "light" | "outline" | "white";
  withBorder?: boolean;
  withBorderPrimary?: boolean;
}) => {
  const { platformColor } = useLayout();

  const borderSize = size === "md" ? 1 : 2;
  const bd = (() => {
    if (!withBorder) {
      return;
    }
    if (withBorderPrimary) {
      return `${borderSize}px solid ${colorsMantine.primary}`;
    }
    return `${borderSize}px solid light-dark(${colorsMantine.gray3}, ${colorsMantine.dark7})`;
  })();

  const avatarContent = (() => {
    if (customIcon) {
      return <IconSeo icon={customIcon} />;
    }
    if (url) {
      return;
    }
    return name;
  })();

  return (
    <Flex align="center" justify="center">
      <AvatarMantine
        bd={bd}
        bg={onClick ? platformColor : "dark"}
        color={color}
        imageProps={{
          "aria-label": name,
        }}
        onClick={onClick}
        p={1}
        radius={radius}
        size={size}
        src={url}
        styles={
          pointer
            ? {
                root: {
                  cursor: "pointer",
                },
              }
            : {}
        }
        variant={variant}
      >
        {avatarContent}
      </AvatarMantine>
    </Flex>
  );
};

export const Avatar = memo(AvatarToMemoize);

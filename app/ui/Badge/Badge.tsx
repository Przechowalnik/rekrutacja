import type { BadgeProps } from "@mantine/core";
import { Badge as MantineBadge } from "@mantine/core";
import { memo } from "react";

type T_Badge = {
  onClick?: () => void;
} & BadgeProps;

const BadgeToMemoize = ({ ...restProps }: T_Badge) => {
  return <MantineBadge {...restProps} />;
};

export const Badge = memo(BadgeToMemoize);

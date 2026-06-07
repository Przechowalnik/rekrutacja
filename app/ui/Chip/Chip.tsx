import type {
  ChipVariant,
  DefaultMantineColor,
  MantineRadius,
  MantineSize,
} from "@mantine/core";
import { Chip as MantineChip } from "@mantine/core";
import type { ReactNode } from "react";
import { memo } from "react";

type T_Chip = {
  checked?: boolean;
  color?: DefaultMantineColor;
  defaultChecked?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  label?: string;
  radius?: MantineRadius;
  size?: MantineSize;
  variant?: ChipVariant;
};

const ChipToMemoize = ({
  checked,
  color,
  defaultChecked,
  disabled,
  icon,
  label,
  radius = "xl",
  size,
  variant = "light",
}: T_Chip) => {
  return (
    <MantineChip
      checked={checked}
      color={color}
      defaultChecked={defaultChecked}
      disabled={disabled}
      icon={icon}
      radius={radius}
      size={size}
      variant={variant}
    >
      {label}
    </MantineChip>
  );
};

export const Chip = memo(ChipToMemoize);

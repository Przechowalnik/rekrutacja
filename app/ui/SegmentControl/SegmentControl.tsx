import type { SegmentedControlProps } from "@mantine/core";
import { SegmentedControl as MantineSegmentControl } from "@mantine/core";
import { memo } from "react";

import { globalIds } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";

const SegmentControl = ({
  color,
  radius = "md",
  size = "md",
  styles,
  ...restProps
}: SegmentedControlProps) => {
  const { platformColor } = useLayout();

  return (
    <MantineSegmentControl
      id={globalIds.dnd}
      {...restProps}
      color={color ?? platformColor}
      radius={radius}
      size={size}
      styles={{
        label: {
          textAlign: "center",
          whiteSpace: "normal",
        },
        ...styles,
      }}
    />
  );
};

export default memo(SegmentControl);

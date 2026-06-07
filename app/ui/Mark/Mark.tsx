import type { MarkProps } from "@mantine/core";
import { Mark as MantineMark } from "@mantine/core";
import { memo } from "react";

import { useLayout } from "~/hooks/useLayout";

const Mark = ({ color, p = 4, ...restProps }: MarkProps) => {
  const { platformColor } = useLayout();

  return <MantineMark {...restProps} color={color ?? platformColor} p={p} />;
};

export default memo(Mark);

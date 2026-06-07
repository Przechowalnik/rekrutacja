import type { MantineSize } from "@mantine/core";

export const generateMinHeightFromSize = ({ size }: { size: MantineSize }) => {
  switch (size) {
    case "xs": {
      return 74;
    }

    case "sm": {
      return 89;
    }

    case "md": {
      return 108;
    }

    case "lg": {
      return 125;
    }

    case "xl": {
      return 142;
    }

    default: {
      return 0;
    }
  }
};

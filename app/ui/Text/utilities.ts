import type { DefaultMantineColor } from "@mantine/core";

type T_GenerateTextGradientResult = {
  deg: number;
  from: DefaultMantineColor;
  to: DefaultMantineColor;
};

export const generateTextGradient = ({
  platformColor,
}: {
  platformColor: DefaultMantineColor;
}): T_GenerateTextGradientResult => {
  switch (platformColor) {
    case "blue": {
      return { deg: 90, from: platformColor, to: "cyan" };
    }

    case "grape": {
      return { deg: 90, from: platformColor, to: "pink" };
    }

    case "indigo": {
      return { deg: 90, from: platformColor, to: "cyan" };
    }

    case "orange": {
      return { deg: 90, from: platformColor, to: "yellow" };
    }

    case "pink": {
      return { deg: 90, from: platformColor, to: "grape" };
    }

    case "teal": {
      return { deg: 90, from: platformColor, to: "green" };
    }

    case "violet": {
      return { deg: 90, from: platformColor, to: "grape" };
    }

    case "cyan": {
      return { deg: 90, from: platformColor, to: "indigo" };
    }

    case "dark": {
      return { deg: 90, from: platformColor, to: "gray" };
    }

    case "gray": {
      return { deg: 90, from: platformColor, to: "dark" };
    }

    case "green": {
      return { deg: 90, from: platformColor, to: "teal" };
    }

    case "lime": {
      return { deg: 90, from: platformColor, to: "green" };
    }

    case "yellow": {
      return { deg: 90, from: platformColor, to: "orange" };
    }

    case "red": {
      return { deg: 90, from: platformColor, to: "orange" };
    }

    default: {
      return { deg: 90, from: "gray", to: "gray" };
    }
  }
};

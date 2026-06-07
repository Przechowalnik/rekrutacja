import type { DefaultMantineColor, MantineColorsTuple } from "@mantine/core";

export interface T_ExtraColors {
  black: string;
  white: string;
  darkBg: string;
  global: string;
  light: string;
  redPoland: string;
}

type ExtendedCustomColors = keyof T_ExtraColors | DefaultMantineColor;

declare module "@mantine/core" {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}

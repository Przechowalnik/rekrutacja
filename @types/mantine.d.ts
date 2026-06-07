// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MantineThemeOverride } from "@mantine/core";

declare module "@mantine/core" {
  export interface MantineThemeColorsOverride {
    colors: Record<
      | "black"
      | "buttons"
      | "darkBg"
      | "global"
      | "light"
      | "white"
      | (string & {}), // NOSONAR
      string[]
    >;
  }
}

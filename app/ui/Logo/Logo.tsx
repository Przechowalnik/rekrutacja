import { Text } from "@mantine/core";

type T_Logo = {
  dark?: boolean;
  height?: string;
  light?: boolean;
  minHeight?: string;
  minWidth?: string;
  width?: string;
};

const BRAND_TEXT = "do-pracy.pl";

export const Logo = ({
  dark,
  height = "42.6px",
  light,
  minHeight,
  minWidth,
  width,
}: T_Logo) => {
  const color = light ? "white" : dark ? "dark.9" : "violet.6";

  return (
    <Text
      aria-label={BRAND_TEXT}
      c={color}
      component="span"
      fw={800}
      h={height}
      mih={minHeight}
      miw={minWidth}
      style={{
        alignItems: "center",
        display: "inline-flex",
        fontSize: `calc(${height} * 0.52)`,
        letterSpacing: "-0.02em",
        lineHeight: height,
        whiteSpace: "nowrap",
      }}
      w={width}
    >
      {BRAND_TEXT}
    </Text>
  );
};

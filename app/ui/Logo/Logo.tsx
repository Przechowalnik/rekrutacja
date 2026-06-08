import { Box, Text } from "@mantine/core";

type T_Logo = {
  dark?: boolean;
  height?: string;
  light?: boolean;
  minHeight?: string;
  minWidth?: string;
  width?: string;
  withoutText?: boolean;
};

const BRAND_TEXT = "do-pracy.pl";

export const Logo = ({
  dark,
  height = "42.6px",
  light,
  minHeight,
  minWidth,
  width,
  withoutText,
}: T_Logo) => {
  const textColor = (() => {
    if (light) {
      return "white";
    }
    if (dark) {
      return "var(--mantine-color-dark-9)";
    }
    return "var(--mantine-color-dark-7)";
  })();
  const accentColor = light ? "white" : "var(--mantine-color-violet-6)";

  return (
    <Box
      aria-label={BRAND_TEXT}
      h={height}
      mih={minHeight}
      miw={minWidth}
      role="img"
      style={{
        alignItems: "center",
        display: "inline-flex",
        gap: `calc(${height} * 0.22)`,
        lineHeight: height,
        whiteSpace: "nowrap",
      }}
      w={width}
    >
      <svg
        aria-hidden="true"
        height={height}
        style={{ display: "block", flexShrink: 0 }}
        viewBox="0 0 48 48"
        width={height}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dpLogoGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#2563eb" />
            <stop offset="1" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <rect
          fill="url(#dpLogoGradient)"
          height="48"
          rx="13"
          width="48"
          x="0"
          y="0"
        />
        {/* briefcase handle */}
        <path
          d="M19 16v-2.5A2.5 2.5 0 0 1 21.5 11h5A2.5 2.5 0 0 1 29 13.5V16"
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeWidth="2.6"
        />
        {/* briefcase body */}
        <rect
          fill="#ffffff"
          height="20"
          rx="4"
          width="28"
          x="10"
          y="16"
        />
        {/* center band + latch (cut-out using brand color) */}
        <rect
          fill="url(#dpLogoGradient)"
          height="4.2"
          rx="2.1"
          width="28"
          x="10"
          y="23.4"
        />
        <rect
          fill="#ffffff"
          height="6"
          rx="1.6"
          width="6"
          x="21"
          y="22.5"
        />
      </svg>
      {!withoutText && (
        <Text
          component="span"
          fw={800}
          style={{
            fontSize: `calc(${height} * 0.46)`,
            letterSpacing: "-0.02em",
          }}
        >
          <Text c={textColor} component="span" inherit>
            do-pracy
          </Text>
          <Text c={accentColor} component="span" inherit>
            .pl
          </Text>
        </Text>
      )}
    </Box>
  );
};

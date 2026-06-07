import type { BoxProps, MantineColor } from "@mantine/core";
import { Box, Divider, Flex } from "@mantine/core";
import { memo, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";

import { InputWrapper } from "../InputWrapper";
import { Text } from "../Text";

type T_Fieldset = {
  color?: MantineColor;
  description?: string;
  disabled?: boolean;
  fontSize?: string;
  fullHeight?: boolean;
  gap?: number;
  legend: string;
  oneLine?: boolean;
  withInputWrapper?: boolean;
  withRequired?: boolean;
} & BoxProps;

const FieldsetToMemoize = ({
  children,
  color,
  description,
  disabled,
  fontSize,
  fullHeight,
  gap = 16,
  legend,
  oneLine,
  withInputWrapper = true,
  withRequired,
  ...restProps
}: PropsWithChildren<T_Fieldset>) => {
  const { t } = useTranslation(namespaces.common);

  if (oneLine) {
    return (
      <Box {...restProps} w="100%">
        <Divider label={legend} mb={24} mt={0} my="md" size={1} />
        {withInputWrapper ? <InputWrapper>{children}</InputWrapper> : children}
      </Box>
    );
  }

  return (
    <Box
      bg={colorsMantine.background}
      component="fieldset"
      m={0}
      maw="100%"
      miw={0}
      opacity={disabled ? 0.6 : 1}
      p="md"
      style={{
        border: `1px solid light-dark(${colorsMantine.gray3}, ${colorsMantine.gray4})`,
        borderRadius: "var(--mantine-radius-md)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        pointerEvents: disabled ? "none" : "auto",
      }}
      w="100%"
      {...(fullHeight ? { h: "100%" } : {})}
      {...restProps}
      pt={description ? 0 : "sm"}
    >
      <Box
        c={color ?? colorsMantine.primary}
        component="legend"
        fs={fontSize}
        fw="bold"
      >
        {legend}
        {withRequired && (
          <span
            style={{
              color: "var(--mantine-color-red-filled)",
              fontWeight: "bold",
            }}
          >
            {" "}
            {t("fieldset.requiredSymbol")}
          </span>
        )}
      </Box>
      {description && (
        <Text c="dimmed" mb="sm" size="sm">
          {description}
        </Text>
      )}
      <Box style={{ flex: 1 }}>
        {withInputWrapper ? (
          <InputWrapper
            fullHeight={fullHeight}
            gap={gap}
            withRequired={withRequired}
          >
            {children}
          </InputWrapper>
        ) : (
          children
        )}
      </Box>
      {withRequired && !withInputWrapper && (
        <Flex gap={4} pt={28}>
          <Text c="gray" size="xs" withTextsToUi>
            {`<i>${t("inputWrapper.required")}</i>`}
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export const Fieldset = memo(FieldsetToMemoize);

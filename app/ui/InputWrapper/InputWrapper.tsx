import { Flex } from "@mantine/core";
import { memo, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";

import { Text } from "../Text";

type T_InputWrapper = {
  fullHeight?: boolean;
  gap?: number;
  withRequired?: boolean;
};

const InputWrapper = ({
  children,
  fullHeight,
  gap = 24,
  withRequired,
}: PropsWithChildren<T_InputWrapper>) => {
  const { t } = useTranslation(namespaces.common);

  return (
    <Flex
      direction="column"
      {...(fullHeight ? { h: "100%", style: { flex: 1 } } : {})}
    >
      <Flex
        align="center"
        direction="column"
        gap={gap}
        justify="flex-end"
        w="100%"
      >
        {children}
      </Flex>
      {withRequired && (
        <Flex gap={4} pt={gap + 12} style={{ marginTop: "auto" }}>
          <Text c="gray" size="xs" withTextsToUi>
            {`<i>${t("inputWrapper.required")}</i>`}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

export default memo(InputWrapper);

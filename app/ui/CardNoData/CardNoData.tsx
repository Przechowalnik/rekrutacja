import { BoxProps, Flex } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { globalClasses } from "~/constants/styles";

import { Text } from "../Text";
import { Title } from "../Title";

type T_CardNoData = {
  description?: string;
  title?: string;
} & BoxProps;

const CardNoDataToMemoize = ({
  description,
  title,
  ...restProps
}: T_CardNoData) => {
  const { t } = useTranslation(namespaces.common);

  return (
    <Flex
      align="center"
      className={globalClasses.opacityDelay}
      direction="column"
      justify="center"
      p={12}
      {...restProps}
    >
      <Title center fw="bold" order={2} p="xs">
        {title ?? t("cardNoData.title")}
      </Title>
      <Text c="gray" center w="100%">
        {description ?? t("cardNoData.description")}
      </Text>
    </Flex>
  );
};

export const CardNoData = memo(CardNoDataToMemoize);

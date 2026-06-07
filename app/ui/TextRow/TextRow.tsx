import type { BoxProps } from "@mantine/core";
import { Box, Divider, Flex } from "@mantine/core";
import type { ReactNode } from "react";
import { memo } from "react";

import { Text } from "../Text";

export type T_TextRowItem = {
  content?: ReactNode;
  description?: string;
  title: string;
};

type T_TextRow = {
  items: T_TextRowItem[];
  textToRight?: boolean;
  titleWidthMobile?: number;
  titleWidthTabletAndDesktop?: number;
} & BoxProps;

const TextRow = ({
  c,
  items = [],
  textToRight,
  titleWidthMobile = 100,
  titleWidthTabletAndDesktop = 200,
  ...restProps
}: T_TextRow) => {
  const mapItems = items.map((item, index) => {
    const isLast = items.length - 1 === index;

    return (
      <Box key={`itemRow_${item.title}`} w="100%">
        <Flex
          align="flex-start"
          direction="row"
          justify="flex-start"
          {...restProps}
        >
          <Text
            c={c}
            fw="bold"
            size="sm"
            w={{
              base: titleWidthMobile,
              xs: titleWidthTabletAndDesktop,
            }}
          >
            {item.title}:
          </Text>
          <Box
            w={{
              base: `calc(100% - ${titleWidthMobile}px)`,
              xs: `calc(100% - ${titleWidthTabletAndDesktop}px)`,
            }}
          >
            {item.description && (
              <Text c={c} size="sm" textRight={textToRight} w="100%">
                {item.description}
              </Text>
            )}
            {item.content}
          </Box>
        </Flex>
        {!isLast && <Divider color="gray.4" mb={0} mt={4} size={1} w="100%" />}
      </Box>
    );
  });

  return (
    <Flex align="flex-start" direction="column" gap={8} justify="flex-start">
      {mapItems}
    </Flex>
  );
};

export default memo(TextRow);

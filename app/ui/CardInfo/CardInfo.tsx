import { Flex, Paper } from "@mantine/core";
import { memo } from "react";

import type { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { Button } from "~/ui/Button";
import { Link } from "~/ui/Link";
import { Text } from "~/ui/Text";
import { Title } from "~/ui/Title";

type T_CardInfo = {
  button?: {
    link: E_Routes;
    text: string;
  };
  description?: string;
  title: string;
  w?: string;
};

const CardInfoToMemoize = ({
  button,
  description,
  title,
  w = "600px",
}: T_CardInfo) => {
  const { getLocalizedRoute } = useLocalizedRoute();

  return (
    <Paper maw="100%" p={48} radius="lg" w={w}>
      <Flex
        align="center"
        direction="column"
        gap={0}
        h="100%"
        justify="center"
        w="100%"
      >
        <div className="center">
          <Title order={1} pb={description ? 0 : 48}>
            {title}
          </Title>
          {description && (
            <Text pb={48} pt="md" size="md">
              {description}
            </Text>
          )}
        </div>
        {button && (
          <Link
            to={getLocalizedRoute({
              route: button.link,
            })}
          >
            <Button size="md">{button.text}</Button>
          </Link>
        )}
      </Flex>
    </Paper>
  );
};

export const CardInfo = memo(CardInfoToMemoize);

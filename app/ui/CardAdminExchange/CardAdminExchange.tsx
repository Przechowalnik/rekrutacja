import { Card, Group, List } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import type { T_Exchange } from "~/models/exchange";

import { Badge } from "../Badge";
import { Button } from "../Button";
import { ButtonWrapper } from "../ButtonWrapper";
import { Link } from "../Link";
import { Mark } from "../Mark";
import { Text } from "../Text";

type T_CardAdminPlan = T_Exchange;

const CardAdminExchangeToMemoize = ({
  enabledAt,
  id,
  name,
  points,
  subscriptionFreeDays,
}: T_CardAdminPlan) => {
  const { t } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();

  return (
    <Card
      bg={colorsMantine.body}
      maw={500}
      padding="lg"
      radius="md"
      shadow="sm"
      w="100%"
      withBorder
    >
      <Group justify="space-between" mb="xs">
        <Text fw="bold" size="md">
          {name}
        </Text>
        <Badge color={enabledAt ? "green" : "red"}>
          {enabledAt ? t("cardAdminPlan.enabled") : t("cardAdminPlan.disabled")}
        </Badge>
      </Group>
      <List my={24} pr={12}>
        <List.Item>
          <Text fw="bold" size="sm">
            {t("inputs.exchangePoints")}: <Mark>{points}</Mark>
          </Text>
        </List.Item>
        <List.Item>
          <Text fw="bold" size="sm">
            {t("inputs.exchangeSubscriptionFreeDays")}:{" "}
            <Mark>{subscriptionFreeDays ?? t("cardAdminExchange.none")}</Mark>
          </Text>
        </List.Item>
      </List>
      <ButtonWrapper p={0} withTopPadding={false}>
        <Link
          to={`${getLocalizedRoute({
            extraPath: `/${id}`,
            route: E_Routes.adminExchangesEdit,
          })}`}
        >
          <Button size="sm" variant="filled">
            {t("cardAdminPoints.buttonEdit")}
          </Button>
        </Link>
      </ButtonWrapper>
    </Card>
  );
};

export const CardAdminExchange = memo(CardAdminExchangeToMemoize);

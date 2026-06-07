import { Card, Group, List } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { E_PlanType } from "~/models/enums";
import type { T_Plans } from "~/models/plans";
import { formatAmountForDisplay } from "~/utilities/price";

import { Badge } from "../Badge";
import { Button } from "../Button";
import { ButtonWrapper } from "../ButtonWrapper";
import { Link } from "../Link";
import { Mark } from "../Mark";
import { Text } from "../Text";

type T_CardAdminPlan = T_Plans[number];

const CardAdminPlanToMemoize = ({
  description,
  enabledAt,
  id,
  interval,
  intervalCount,
  listingDurationMonths,
  maximumListingsInMonth,
  name,
  price,
  type,
}: T_CardAdminPlan) => {
  const { t } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();

  const isTrialPlanType = type === E_PlanType.TRIAL;

  return (
    <Card
      bg={colorsMantine.body}
      maw={350}
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
        {!isTrialPlanType && (
          <Badge color={enabledAt ? "green" : "red"}>
            {enabledAt
              ? t("cardAdminPlan.enabled")
              : t("cardAdminPlan.disabled")}
          </Badge>
        )}
      </Group>
      <Text c="gray" size="sm">
        {description}
      </Text>
      <List my={24} pr={12}>
        <List.Item>
          <Text fw="bold" size="sm">
            {t("cardAdminPlan.type")}: <Mark>{t(`plansType.${type}`)}</Mark>
          </Text>
        </List.Item>
        {!isTrialPlanType && (
          <List.Item>
            <Text fw="bold" size="sm">
              {t("cardAdminPlan.price")}:{" "}
              <Mark>{formatAmountForDisplay(price)}</Mark>
            </Text>
          </List.Item>
        )}
        {interval && (
          <List.Item>
            <Text fw="bold" size="sm">
              {t("cardAdminPlan.interval")}:{" "}
              <Mark>{t(`plansInterval.${interval}`)}</Mark>
            </Text>
          </List.Item>
        )}
        {typeof intervalCount === "number" && (
          <List.Item>
            <Text fw="bold" size="sm">
              {t("cardAdminPlan.intervalCount")}: <Mark>{intervalCount}</Mark>
            </Text>
          </List.Item>
        )}
        <List.Item>
          <Text fw="bold" size="sm">
            {t("inputs.planMaximumListingsInMonth")}:{" "}
            <Mark>{maximumListingsInMonth}</Mark>
          </Text>
        </List.Item>
        <List.Item>
          <Text fw="bold" size="sm">
            {t("inputs.planListingDurationMonths")}:{" "}
            <Mark>{listingDurationMonths}</Mark>
          </Text>
        </List.Item>
      </List>
      <ButtonWrapper p={0} withTopPadding={false}>
        <Link
          to={`${getLocalizedRoute({
            extraPath: `/${id}`,
            route: E_Routes.adminPlansEdit,
          })}`}
        >
          <Button size="sm" variant="filled">
            {t("cardAdminPlan.buttonEdit")}
          </Button>
        </Link>
      </ButtonWrapper>
    </Card>
  );
};

export const CardAdminPlan = memo(CardAdminPlanToMemoize);

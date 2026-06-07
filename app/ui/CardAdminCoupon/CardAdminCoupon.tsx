import { Card, Group, List } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import type { T_Coupons } from "~/models/coupons";
import { replaceDateToYearMonthHoursMinutesInWordsDay } from "~/utilities/date";
import { formatAmountForDisplay } from "~/utilities/price";

import { Badge } from "../Badge";
import { Button } from "../Button";
import { ButtonWrapper } from "../ButtonWrapper";
import { Link } from "../Link";
import { Mark } from "../Mark";
import { Text } from "../Text";

type T_CardAdminCoupon = T_Coupons[number] & { withEdit?: boolean };

const CardAdminCouponToMemoize = ({
  amountOff,
  durationInMonths,
  enabledAt,
  endDate,
  firstTimeTransaction,
  id,
  maxRedemptions,
  minimumAmount,
  name,
  percentOff,
  plans,
  promotionCode,
  withEdit = true,
}: T_CardAdminCoupon) => {
  const { t } = useTranslation(namespaces.common);
  const { platformColor } = useLayout();
  const { getLocalizedRoute } = useLocalizedRoute();

  const mapPlans = plans?.map(item => (
    <Badge color={platformColor} key={`plan_${item.id}`} size="xs">
      {item.name}
    </Badge>
  ));

  return (
    <Card
      bg={colorsMantine.body}
      maw={500}
      padding="md"
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
          {enabledAt
            ? t("cardAdminCoupon.enabled")
            : t("cardAdminCoupon.disabled")}
        </Badge>
      </Group>
      <Text c="gray" mb="md" size="md">
        {`${t("inputs.couponPromotionCode")}: ${promotionCode}`}
      </Text>
      <Group gap={4} justify="flex-start">
        {mapPlans}
      </Group>
      <List my={24} pr={12}>
        {percentOff && (
          <List.Item>
            <Text fw="bold" size="sm">
              {t("cardAdminCoupon.percentOff")}: <Mark>{percentOff}</Mark>
            </Text>
          </List.Item>
        )}
        {!!amountOff && (
          <List.Item>
            <Text fw="bold" size="sm">
              {t("cardAdminCoupon.amountOff")}:{" "}
              <Mark>{formatAmountForDisplay(amountOff)}</Mark>
            </Text>
          </List.Item>
        )}
        {!!minimumAmount && (
          <List.Item>
            <Text fw="bold" size="sm">
              {t("cardAdminCoupon.minimumAmount")}:{" "}
              <Mark>{formatAmountForDisplay(minimumAmount)}</Mark>
            </Text>
          </List.Item>
        )}
        <List.Item>
          <Text fw="bold" size="sm">
            {t("cardAdminCoupon.durationInMonths")}:{" "}
            <Mark>{durationInMonths}</Mark>
          </Text>
        </List.Item>
        {!!maxRedemptions && (
          <List.Item>
            <Text fw="bold" size="sm">
              {t("cardAdminCoupon.maxRedemptions")}:{" "}
              <Mark>{Number(maxRedemptions)}</Mark>
            </Text>
          </List.Item>
        )}
        {!!endDate && (
          <List.Item>
            <Text fw="bold" size="sm" withTextsToUi>
              {`${t("cardAdminCoupon.endDate")}: <b>
            ${replaceDateToYearMonthHoursMinutesInWordsDay({ date: endDate.toString() })}</b>`}
            </Text>
          </List.Item>
        )}
        <List.Item>
          <Text fw="bold" size="sm">
            {t("cardAdminCoupon.firstTimeTransaction")}:{" "}
            <Mark>
              {firstTimeTransaction
                ? t("cardAdminCoupon.enabled")
                : t("cardAdminCoupon.disabled")}
            </Mark>
          </Text>
        </List.Item>
      </List>
      {withEdit && (
        <ButtonWrapper p={0} withTopPadding={false}>
          <Link
            to={`${getLocalizedRoute({
              extraPath: `/${id}`,
              route: E_Routes.adminCouponEdit,
            })}`}
          >
            <Button size="sm" variant="filled">
              {t("cardAdminCoupon.buttonEdit")}
            </Button>
          </Link>
        </ButtonWrapper>
      )}
    </Card>
  );
};

export const CardAdminCoupon = memo(CardAdminCouponToMemoize);

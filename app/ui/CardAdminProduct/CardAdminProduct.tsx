import { Card, Group, List } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { T_Products } from "~/models/products";
import { formatAmountForDisplay } from "~/utilities/price";

import { Button } from "../Button";
import { ButtonWrapper } from "../ButtonWrapper";
import { Link } from "../Link";
import { Mark } from "../Mark";
import { Text } from "../Text";

type T_CardAdminProduct = T_Products[number];

const CardAdminProductToMemoize = ({
  id,
  name,
  points_1,
  points_2_5,
  points_6_plus,
  price_1,
  price_2_5,
  price_6_plus,
}: T_CardAdminProduct) => {
  const { t } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();

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
      </Group>
      <List my={24} pr={12}>
        <List.Item>
          <Text fw="bold" size="sm">
            {t("cardAdminProduct.price_1")}:{" "}
            <Mark>{formatAmountForDisplay(price_1)}</Mark>
          </Text>
        </List.Item>
        <List.Item>
          <Text fw="bold" size="sm">
            {t("cardAdminProduct.price_2_5")}:{" "}
            <Mark>{formatAmountForDisplay(price_2_5)}</Mark>
          </Text>
        </List.Item>
        <List.Item>
          <Text fw="bold" size="sm">
            {t("cardAdminProduct.price_6_plus")}:{" "}
            <Mark>{formatAmountForDisplay(price_6_plus)}</Mark>
          </Text>
        </List.Item>
        <List.Item>
          <Text fw="bold" size="sm">
            {t("cardAdminProduct.points_1")}: <Mark>{points_1}</Mark>
          </Text>
        </List.Item>
        <List.Item>
          <Text fw="bold" size="sm">
            {t("cardAdminProduct.points_2_5")}: <Mark>{points_2_5}</Mark>
          </Text>
        </List.Item>
        <List.Item>
          <Text fw="bold" size="sm">
            {t("cardAdminProduct.points_6_plus")}: <Mark>{points_6_plus}</Mark>
          </Text>
        </List.Item>
      </List>
      <ButtonWrapper p={0} withTopPadding={false}>
        <Link
          to={`${getLocalizedRoute({
            extraPath: `/${id}`,
            route: E_Routes.adminProductsEdit,
          })}`}
        >
          <Button size="sm" variant="filled">
            {t("cardAdminProduct.buttonEdit")}
          </Button>
        </Link>
      </ButtonWrapper>
    </Card>
  );
};

export const CardAdminProduct = memo(CardAdminProductToMemoize);

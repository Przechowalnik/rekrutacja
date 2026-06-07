import { Flex } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import type { T_Plans } from "~/models/plans";
import { calculateNetAmount } from "~/utilities/calculations";
import { formatAmountForDisplayWithElements } from "~/utilities/price";

import { Text } from "../Text";
import { Title } from "../Title";
import classes from "./cardPlan.styles.module.css";

const CardPlanToMemoize = ({
  listingDurationMonths,
  maximumListingsInMonth,
  price,
  type,
}: T_Plans[number]) => {
  const { t } = useTranslation(namespaces.common);

  const { currency, priceNumber } = formatAmountForDisplayWithElements(
    Number(price),
  );

  return (
    <div className={classes.cardPlan}>
      <div className={classes.container}>
        <div className={`${classes.header} ${classes[`gradient${type}`]}`}>
          <Title
            c="white"
            center
            className={classes["plan-type"]}
            fw="normal"
            order={2}
          >
            {t(`plansType.${type}`)}
          </Title>
          <div className={classes.priceWrapper}>
            <Text c="white" center className={classes.price} fw="bold">
              {Number(priceNumber)}
            </Text>
            <div>
              <Text c="white" center className={classes.currency} fw="bold">
                {currency} / {t("cardPlan.gross")}
              </Text>
              <Text c="white" center className={classes.month}>
                {t("cardPlan.perMonth")}
              </Text>
            </div>
          </div>
          <Text c="white" center mt="sm" size="md">
            {`( ${calculateNetAmount({
              grossAmount: Number(priceNumber),
            })} ${currency} + VAT 23% )`}
          </Text>
        </div>
        <Flex direction="column" gap={12} p="sm">
          <div>
            <Text size="sm">{t("inputs.planMaximumListingsInMonth")}</Text>
            <Text fw="bold" size="md">
              {maximumListingsInMonth}
            </Text>
          </div>
        </Flex>
        <Flex direction="column" gap={12} p="sm">
          <div>
            <Text size="sm">{t("inputs.planListingDurationMonths")}</Text>
            <Text fw="bold" size="md">
              {listingDurationMonths}
            </Text>
          </div>
        </Flex>
      </div>
    </div>
  );
};

export const CardPlan = memo(CardPlanToMemoize);

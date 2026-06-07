import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { useUser } from "~/hooks/useUser";
import {
  hasDateExpired,
  replaceDateToYearMonthHoursMinutesInWordsDay,
} from "~/utilities/date";

import { Card } from "../Card";
import { Text } from "../Text";

const CardFreeTrialToMemoize = () => {
  const { t } = useTranslation(namespaces.common);
  const { user } = useUser();

  if (!user?.company?.freeTrial) {
    return null;
  }

  const { endDate, plan, startDate } = user.company.freeTrial;
  const expiredTrial = hasDateExpired(endDate.toString());

  return (
    <Card
      badges={[
        {
          color: expiredTrial ? "red" : "green",
          label: expiredTrial
            ? t(`subscriptionStatus.INACTIVE`)
            : t(`cardFreeTrial.active`),
        },
      ]}
      color="gray"
      title={t("cardFreeTrial.title")}
    >
      <Text c="white" size="sm">
        {t("cardFreeTrial.plan")}: <b>{t(`plansType.${plan.type}`)}</b>
      </Text>
      <Text c="white" size="sm" withTextsToUi>
        {`${t("cardFreeTrial.startDate")}: <b>
            ${replaceDateToYearMonthHoursMinutesInWordsDay({ date: startDate.toString() })}</b>`}
      </Text>
      {endDate && (
        <Text c="white" size="sm" withTextsToUi>
          {`${t("cardFreeTrial.endDate")}: <b>
              ${replaceDateToYearMonthHoursMinutesInWordsDay({ date: endDate.toString() })}</b>`}
        </Text>
      )}
    </Card>
  );
};

export const CardFreeTrial = memo(CardFreeTrialToMemoize);

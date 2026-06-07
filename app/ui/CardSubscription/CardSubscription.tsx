import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { formNames } from "~/lib/zodFormValidator";
import { E_SubscriptionStatus } from "~/models/enums";
import type { T_Subscription } from "~/models/subscription";
import { calculateNetAmount } from "~/utilities/calculations";
import { replaceDateToYearMonthHoursMinutesInWordsDay } from "~/utilities/date";
import { convertToFormData } from "~/utilities/form";
import { formatAmountForDisplayWithElements } from "~/utilities/price";

import type { T_CardBadge } from "../Card";
import { Card } from "../Card";
import { Text } from "../Text";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

const CardSubscriptionToMemoize = ({
  coupon,
  endDate,
  endDateExchangeFreeDays,
  extraFreeDaysInCurrentPeriod,
  id,
  nextPaymentAttempt,
  plan,
  startDate,
  status,
}: T_Subscription) => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const { t } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();
  const fetcher = useFetcherWithActions({});

  const { currency, priceNumber } = formatAmountForDisplayWithElements(
    Number(plan.price),
  );

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleCancelSubscription = useCallback(() => {
    setAuthenticatorOpen(true);
  }, []);

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorOpen(false);

      if (!id) {
        return;
      }

      fetcher.submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.checkboxSubscriptionDeleteImmediately]:
            status === E_SubscriptionStatus.TO_BE_CANCELLED,
          [formNames.subscriptionId]: id,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.apiCompanySubscriptionDelete,
          }),
          method: "delete",
        },
      );
    },
    [id, status],
  );

  const badges: T_CardBadge[] = [];
  if (
    status === E_SubscriptionStatus.ACTIVE ||
    status === E_SubscriptionStatus.TRIALING ||
    status === E_SubscriptionStatus.TO_BE_CANCELLED
  ) {
    badges.push({
      color: "green",
      label: t(`subscriptionStatus.${status}`),
    });
  } else if (
    status === E_SubscriptionStatus.CANCELLED ||
    status === E_SubscriptionStatus.UNPAID
  ) {
    badges.push({
      color: "red",
      label: t(`subscriptionStatus.${status}`),
    });
  }

  return (
    <>
      <ModalAuthenticator
        onClose={handleCloseAuthenticator}
        onSuccess={handleAuthenticatorOnSuccess}
        opened={authenticatorOpen}
      />
      <Card
        badges={badges}
        color="gray"
        customButtons={[
          {
            color: "red",
            label:
              status === E_SubscriptionStatus.TO_BE_CANCELLED
                ? t("cardSubscription.buttonCancelSubscriptionImmediately")
                : t("cardSubscription.buttonCancelSubscription"),
            onClick: handleCancelSubscription,
            variant: "filled",
          },
        ]}
        title={t("cardSubscription.title")}
      >
        {!!plan && (
          <Text c="white" size="sm">
            {t("cardSubscription.plan")}: <b>{t(`plansType.${plan?.type}`)}</b>
          </Text>
        )}
        {!!plan?.interval && typeof plan.intervalCount === "number" && (
          <>
            <Text c="white" size="sm" withHTML>
              {t("cardSubscription.price", {
                currency: currency,
                interval: t(`plansJustInterval.${plan.interval}`),
                price: priceNumber,
              })}
            </Text>
            <Text c="white" size="sm" withHTML>
              {t("cardSubscription.priceNet", {
                currency: currency,
                interval: t(`plansJustInterval.${plan.interval}`),
                price: calculateNetAmount({
                  grossAmount: Number(priceNumber),
                }),
              })}
            </Text>
          </>
        )}
        {!!coupon && (
          <Text c="white" size="sm">
            {t("cardSubscription.coupon")}: <b>{coupon?.name ?? "-"}</b>
          </Text>
        )}
        <Text c="white" size="sm" withTextsToUi>
          {`${t("cardSubscription.startDate")}: <b>
            ${replaceDateToYearMonthHoursMinutesInWordsDay({ date: startDate.toString() })}</b>`}
        </Text>
        {!!endDate && (
          <Text c="white" size="sm" withTextsToUi>
            {`${t("cardSubscription.endDate")}: <b>
              ${replaceDateToYearMonthHoursMinutesInWordsDay({ date: endDate.toString() })}</b>`}
          </Text>
        )}
        {!!extraFreeDaysInCurrentPeriod && (
          <Text c="white" size="sm" withTextsToUi>
            {`${t("cardSubscription.extraFreeDaysInCurrentPeriod")}: <b>
              ${extraFreeDaysInCurrentPeriod}</b>`}
          </Text>
        )}
        {!!endDateExchangeFreeDays && (
          <Text c="white" size="sm" withTextsToUi>
            {`${t("cardSubscription.endDateExchangeFreeDays")}: <b>
              ${replaceDateToYearMonthHoursMinutesInWordsDay({
                date: endDateExchangeFreeDays.toString(),
              })}</b>`}
          </Text>
        )}
        {!!nextPaymentAttempt && (
          <Text c="white" size="sm" withTextsToUi>
            {`${t("cardSubscription.nextPaymentAttempt")}: <b>
              ${replaceDateToYearMonthHoursMinutesInWordsDay({
                date: nextPaymentAttempt.toString(),
              })}</b>`}
          </Text>
        )}
      </Card>
    </>
  );
};

export const CardSubscription = memo(CardSubscriptionToMemoize);

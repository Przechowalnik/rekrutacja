import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { SyntheticEvent } from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { E_SubscriptionStatus } from "~/models/enums";
import type { T_Exchanges } from "~/models/exchanges";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Form } from "~/ui/Form";
import { Section } from "~/ui/Section";
import { SelectExchange } from "~/ui/SelectExchange";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

type T_CompanyPointsExchangesPage = {
  exchanges: T_Exchanges;
};

export const CompanyPointsExchangesPage = ({
  exchanges,
}: T_CompanyPointsExchangesPage) => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [selectedExchangeId, setSelectedExchangeId] = useState<null | string>(
    null,
  );

  const { t } = useTranslation(namespaces.companyPointsExchanges);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { user } = useUser();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.exchangeId]: "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      setSelectedExchangeId(values[formNames.exchangeId] ?? null);
    },
    validate: {
      [formNames.exchangeId]: value =>
        checkFormValidator({ formName: formNames.planId, value }),
    },
  });

  const filterActiveSubscription =
    user?.company?.subscriptions?.filter(
      item => item.status !== E_SubscriptionStatus.CANCELLED,
    ) ?? [];

  const isExtraFreeDaysInCurrentPeriodInCurrentSubscription =
    filterActiveSubscription.some(item => item.extraFreeDaysInCurrentPeriod);

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorOpen(false);

      const formData = form.getValues();

      if (!formData) {
        return;
      }

      const { exchangeId } = formData;

      if (!exchangeId) {
        notifications.show({
          color: "red",
          message: "",
          title: tCommon(`formValidator.noSelectedExchange`),
        });
        return;
      }

      const foundActiveExchange = exchanges.find(
        item => item.id === exchangeId,
      );

      if (!foundActiveExchange) {
        notifications.show({
          color: "red",
          message: "",
          title: tCommon(`formValidator.noSelectedExchange`),
        });
        return;
      }

      if (foundActiveExchange.points > (user?.company?.points?.balance ?? 0)) {
        notifications.show({
          color: "red",
          message: "",
          title: tCommon(`formValidator.noPointsToExchange`),
        });
        return;
      }

      if (
        foundActiveExchange.subscriptionFreeDays &&
        isExtraFreeDaysInCurrentPeriodInCurrentSubscription
      ) {
        notifications.show({
          color: "red",
          message: tNotifications(`exchangeSubscriptionOnlyOneInMonth.message`),
          title: tNotifications(`exchangeSubscriptionOnlyOneInMonth.title`),
        });
        return;
      }

      if (
        foundActiveExchange.subscriptionFreeDays &&
        user?.company?.freeTrial
      ) {
        notifications.show({
          color: "red",
          message: tNotifications(`noNeedActiveFreeTrial.message`),
          title: tNotifications(`noNeedActiveFreeTrial.title`),
        });
        return;
      }

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          ...formData,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.companyPointsExchanges,
          }),
          method: "patch",
        },
      );
    },
    [
      form,
      exchanges,
      user,
      isExtraFreeDaysInCurrentPeriodInCurrentSubscription,
    ],
  );

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleSubmit = async (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    const { exchangeId } = values;

    if (!exchangeId) {
      notifications.show({
        color: "red",
        message: "",
        title: tCommon(`formValidator.noSelectedExchange`),
      });
      return;
    }

    const foundActiveExchange = exchanges.find(item => item.id === exchangeId);

    if (!foundActiveExchange) {
      notifications.show({
        color: "red",
        message: "",
        title: tCommon(`formValidator.noSelectedExchange`),
      });
      return;
    }

    if (foundActiveExchange.points > (user?.company?.points?.balance ?? 0)) {
      notifications.show({
        color: "red",
        message: "",
        title: tCommon(`formValidator.noPointsToExchange`),
      });
      return;
    }

    if (
      foundActiveExchange.subscriptionFreeDays &&
      isExtraFreeDaysInCurrentPeriodInCurrentSubscription
    ) {
      notifications.show({
        color: "red",
        message: tNotifications(`exchangeSubscriptionOnlyOneInMonth.message`),
        title: tNotifications(`exchangeSubscriptionOnlyOneInMonth.title`),
      });
      return;
    }

    if (foundActiveExchange.subscriptionFreeDays && user?.company?.freeTrial) {
      notifications.show({
        color: "red",
        message: tNotifications(`noNeedActiveFreeTrial.message`),
        title: tNotifications(`noNeedActiveFreeTrial.title`),
      });
      return;
    }

    setAuthenticatorOpen(true);
  };

  return (
    <>
      <ModalAuthenticator
        onClose={handleCloseAuthenticator}
        onSuccess={handleAuthenticatorOnSuccess}
        opened={authenticatorOpen}
      />
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          alert={
            isExtraFreeDaysInCurrentPeriodInCurrentSubscription
              ? t("alert", {
                  tooltipBillingPeriod: tQuestions(
                    "companyPoints.billingPeriod.description",
                  ),
                })
              : undefined
          }
          breadcrumbs={[
            E_Routes.home,
            E_Routes.company,
            E_Routes.companyPoints,
            E_Routes.companyPointsExchanges,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.companyPoints} />
              <Button
                disabled={!selectedExchangeId}
                tooltip={{
                  label: tCommon(`formValidator.noSelectedExchange`),
                }}
                type="submit"
              >
                {t("buttonAdd")}
              </Button>
            </>
          }
          description={t("description")}
          information={t("information", {
            pointsBalance: user?.company?.points?.balance ?? 0,
          })}
          pageMeta={{
            route: E_Routes.companyPointsExchanges,
          }}
          questions={[
            {
              description: tQuestions(
                "companyPoints.subscriptionStatus.description",
              ),
              title: tQuestions("companyPoints.subscriptionStatus.title"),
            },
            {
              description: tQuestions(
                "companyPoints.billingPeriod.description",
              ),
              title: tQuestions("companyPoints.billingPeriod.title"),
            },
          ]}
          size="md"
          title={t("title")}
          withHTML={false}
          withTextsToUi
        >
          <SelectExchange exchanges={exchanges} form={form} />
        </Section>
      </Form>
    </>
  );
};

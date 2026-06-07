import { Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { formNames } from "~/lib/zodFormValidator";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { CardStripe } from "~/ui/CardStripe";
import { Section } from "~/ui/Section";
import { convertToFormData } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const CompanyCardPage = () => {
  const [buttonLoading, setButtonLoading] = useState(false);
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [authenticatorDeleteCardOpen, setAuthenticatorDeleteCardOpen] =
    useState(false);

  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t } = useTranslation(namespaces.companyCard);
  const { user } = useUser();
  const stripe = useStripe();
  const elements = useElements();
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const hasActiveCard = user?.company?.stripe?.customerHasCard;

  const handleUpdateCard = useCallback(async () => {
    if (!stripe || !elements) {
      return;
    }

    setButtonLoading(true);

    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      card: cardElement!,
      type: "card",
    });

    setButtonLoading(false);

    if (error?.code === "invalid_number") {
      notifications.show({
        color: "red",
        message: tNotifications(`errorCardNumber.message`),
        title: tNotifications(`errorCardNumber.title`),
      });
      return;
    }

    if (
      error?.code === "invalid_expiry_month_past" ||
      error?.code === "invalid_expiry_year_past" ||
      error?.code === "incomplete_expiry"
    ) {
      notifications.show({
        color: "red",
        message: tNotifications(`errorCardExpiry.message`),
        title: tNotifications(`errorCardExpiry.title`),
      });
      return;
    }

    if (error?.code === "incomplete_cvc") {
      notifications.show({
        color: "red",
        message: tNotifications(`errorCardCvc.message`),
        title: tNotifications(`errorCardCvc.title`),
      });
      return;
    }

    if (error?.code === "incomplete_expiry") {
      notifications.show({
        color: "red",
        message: tNotifications(`errorCardExpiry.message`),
        title: tNotifications(`errorCardExpiry.title`),
      });
      return;
    }

    if (!paymentMethod || error) {
      notifications.show({
        color: "red",
        message: tNotifications(`errorInPaymentMethod.message`),
        title: tNotifications(`errorInPaymentMethod.title`),
      });
      return;
    }

    setAuthenticatorOpen(true);
  }, [elements, stripe]);

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleCloseAuthenticatorDeleteCard = useCallback(() => {
    setAuthenticatorDeleteCardOpen(false);
  }, []);

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorOpen(false);

      if (!stripe || !elements) {
        return;
      }

      setButtonLoading(true);

      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        card: cardElement!,
        type: "card",
      });

      setButtonLoading(false);

      if (error?.code === "invalid_number") {
        notifications.show({
          color: "red",
          message: tNotifications(`errorCardNumber.message`),
          title: tNotifications(`errorCardNumber.title`),
        });
        return;
      }

      if (
        error?.code === "invalid_expiry_month_past" ||
        error?.code === "invalid_expiry_year_past" ||
        error?.code === "incomplete_expiry"
      ) {
        notifications.show({
          color: "red",
          message: tNotifications(`errorCardExpiry.message`),
          title: tNotifications(`errorCardExpiry.title`),
        });
        return;
      }

      if (error?.code === "incomplete_cvc") {
        notifications.show({
          color: "red",
          message: tNotifications(`errorCardCvc.message`),
          title: tNotifications(`errorCardCvc.title`),
        });
        return;
      }

      if (error?.code === "incomplete_expiry") {
        notifications.show({
          color: "red",
          message: tNotifications(`errorCardExpiry.message`),
          title: tNotifications(`errorCardExpiry.title`),
        });
        return;
      }

      if (!paymentMethod || error) {
        notifications.show({
          color: "red",
          message: tNotifications(`errorInPaymentMethod.message`),
          title: tNotifications(`errorInPaymentMethod.title`),
        });
        return;
      }

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.paymentMethodId]: paymentMethod.id,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.companyCard,
          }),
          method: "post",
        },
      );
    },
    [stripe, elements],
  );

  const handleDeleteCard = useCallback(() => {
    if (
      !user?.company?.stripe?.customerHasCard ||
      user?.company?.isActiveSubscription
    ) {
      return;
    }

    setAuthenticatorDeleteCardOpen(true);
  }, [user]);

  const handleAuthenticatorOnSuccessDeleteCard = useCallback(
    async (authenticator: number | string) => {
      if (
        !user?.company?.stripe?.customerHasCard ||
        user?.company?.isActiveSubscription
      ) {
        return;
      }

      setAuthenticatorOpen(false);

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.companyCard,
          }),
          method: "delete",
        },
      );
    },
    [user],
  );

  return (
    <>
      <ModalAuthenticator
        onClose={handleCloseAuthenticatorDeleteCard}
        onSuccess={handleAuthenticatorOnSuccessDeleteCard}
        opened={authenticatorDeleteCardOpen}
      />
      <ModalAuthenticator
        onClose={handleCloseAuthenticator}
        onSuccess={handleAuthenticatorOnSuccess}
        opened={authenticatorOpen}
      />
      <Section
        breadcrumbs={[E_Routes.home, E_Routes.company, E_Routes.companyCard]}
        buttons={
          <>
            <ButtonArrowLeft routeTo={E_Routes.company} />
            {user?.company?.stripe?.customerHasCard && (
              <Button
                color="red"
                disabled={!!user?.company?.isActiveSubscription}
                onClick={handleDeleteCard}
                tooltip={{
                  label: t("tooltipCard"),
                }}
                variant="light"
              >
                {t("buttonDelete")}
              </Button>
            )}
            <ButtonSave loading={buttonLoading} onClick={handleUpdateCard} />
          </>
        }
        description={t("description")}
        information={
          user?.company?.stripe?.costumerCardLast4Numbers
            ? tCommon("switchCardStripe.cardInfo", {
                cardLast4Numbers:
                  user?.company?.stripe?.costumerCardLast4Numbers,
              })
            : t("noCard")
        }
        pageMeta={{
          route: E_Routes.companyCard,
        }}
        questions={[
          {
            description: tQuestions("companyCard.updateCard.description"),
            title: tQuestions("companyCard.updateCard.title"),
          },
        ]}
        size="md"
        title={hasActiveCard ? t("title") : t("titleAdd")}
      >
        <Flex align="center" direction="column" justify="center">
          <CardStripe mt={24} />
        </Flex>
      </Section>
    </>
  );
};

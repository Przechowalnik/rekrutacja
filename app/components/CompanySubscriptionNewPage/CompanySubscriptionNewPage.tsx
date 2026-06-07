import { Divider, Flex } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { SyntheticEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { type T_Coupon, Z_Coupon } from "~/models/coupon";
import type { T_Plans } from "~/models/plans";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { CardCoupon } from "~/ui/CardCoupon";
import { CardPlan } from "~/ui/CardPlan";
import { CardSummary } from "~/ui/CardSummary";
import { Collapse } from "~/ui/Collapse";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { SelectPlan } from "~/ui/SelectPlan";
import { SwitchCardStripe } from "~/ui/SwitchCardStripe";
import { Title } from "~/ui/Title";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

type T_CompanySubscriptionNewPage = {
  plans: T_Plans;
};

export const CompanySubscriptionNewPage = ({
  plans,
}: T_CompanySubscriptionNewPage) => {
  const [switchCard, setSwitchCard] = useState(false);
  const [fetchedCoupon, setFetchedCoupon] = useState<null | T_Coupon>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<null | string>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t } = useTranslation(namespaces.companySubscriptionNew);
  const { user } = useUser();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const submit = useSubmitWithActions();
  const { platformColor } = useLayout();
  const { getLocalizedRoute } = useLocalizedRoute();
  const fetcher = useFetcherWithActions({
    schema: z.object({
      coupon: Z_Coupon.optional().nullable(),
    }),
  });

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.couponPromotionCode]: "",
      [formNames.planId]: "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      setSelectedPlanId(values[formNames.planId] ?? null);
      if (!values[formNames.couponPromotionCode]) {
        setFetchedCoupon(null);
      }
    },
    validate: {
      [formNames.couponPromotionCode]: value =>
        checkFormValidator({
          formName: formNames.couponPromotionCode,
          optional: true,
          value,
        }),
      [formNames.planId]: value =>
        checkFormValidator({ formName: formNames.planId, value }),
    },
  });

  useEffect(() => {
    setFetchedCoupon(null);
  }, [selectedPlanId]);

  useEffect(() => {
    if (fetcher.data?.coupon) {
      setFetchedCoupon(fetcher.data?.coupon);
      return;
    }

    setFetchedCoupon(null);
  }, [fetcher]);

  useEffect(() => {
    if (user?.company?.isActiveSubscription) {
      navigate(
        getLocalizedRoute({
          route: E_Routes.companySubscriptions,
        }),
      );
    }
  }, [user]);

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleChangeCardStripe = useCallback((value: boolean) => {
    setSwitchCard(value);
  }, []);

  const handleSubmit = async (
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    if (!stripe || !elements) {
      notifications.show({
        color: "red",
        message: "",
        title: tCommon(`formValidator.somethingWentWrong`),
      });
      return;
    }

    if (switchCard) {
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
    }

    setAuthenticatorOpen(true);
  };

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorOpen(false);

      const formData = form.getValues();

      if (!formData || !stripe || !elements) {
        notifications.show({
          color: "red",
          message: "",
          title: tCommon(`formValidator.somethingWentWrong`),
        });
        return;
      }

      if (!switchCard) {
        submit(
          convertToFormData({
            [formNames.authenticator]: authenticator,
            [formNames.couponPromotionCode]:
              formData[formNames.couponPromotionCode],
            [formNames.planId]: formData[formNames.planId],
          }),
          {
            action: getLocalizedRoute({
              route: E_Routes.companySubscriptionNew,
            }),
            method: "post",
          },
        );
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
          [formNames.couponPromotionCode]:
            formData[formNames.couponPromotionCode],
          [formNames.paymentMethodId]: paymentMethod.id,
          [formNames.planId]: formData[formNames.planId],
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.companySubscriptionNew,
          }),
          method: "post",
        },
      );
    },
    [form, stripe, elements, switchCard],
  );

  const handleCheckCoupon = () => {
    const formData = form.getValues();

    if (!formData?.[formNames.couponPromotionCode]) {
      notifications.show({
        color: "red",
        message: tNotifications(`noPromotionCode.message`),
        title: tNotifications(`noPromotionCode.title`),
      });
      return;
    }

    const errorMessage = checkFormValidator({
      formName: formNames.couponPromotionCode,
      optional: true,
      value: formData?.[formNames.couponPromotionCode],
    });

    if (errorMessage) {
      notifications.show({
        color: "red",
        message: "",
        title: tCommon(`formValidator.${errorMessage}`),
      });
      return;
    }

    if (!formData?.[formNames.planId]) {
      notifications.show({
        color: "red",
        message: tNotifications(`noSelectedPlan.message`),
        title: tNotifications(`noSelectedPlan.title`),
      });
      return;
    }

    fetcher.submit(
      convertToFormData({
        [formNames.couponPromotionCode]:
          formData?.[formNames.couponPromotionCode].toUpperCase(),
        [formNames.planId]: formData?.[formNames.planId],
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.companySubscriptionNew,
        }),
        method: "put",
      },
    );
  };

  const foundSelectedPlan = plans.find(item => item.id === selectedPlanId);

  const disabledButton = !foundSelectedPlan;

  return (
    <>
      <ModalAuthenticator
        onClose={handleCloseAuthenticator}
        onSuccess={handleAuthenticatorOnSuccess}
        opened={authenticatorOpen}
      />
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          breadcrumbs={[
            E_Routes.home,
            E_Routes.company,
            E_Routes.companySubscriptions,
            E_Routes.companySubscriptionNew,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.companySubscriptions} />
              <Button
                disabled={
                  disabledButton || !!user?.company?.isActiveSubscription
                }
                loading={buttonLoading}
                tooltip={{
                  label: t("tooltipNoSelectedPlan"),
                  position: "top",
                }}
                type="submit"
              >
                {t("buttonSave")}
              </Button>
            </>
          }
          description={t("description")}
          pageMeta={{
            route: E_Routes.companySubscriptionNew,
          }}
          questions={[
            {
              description: tQuestions(
                "companySubscriptions.maximumSubscriptions.description",
              ),
              title: tQuestions(
                "companySubscriptions.maximumSubscriptions.title",
              ),
            },
            {
              description: tQuestions(
                "companySubscriptions.newSubscriptionOnActiveFreeTrial.description",
              ),
              title: tQuestions(
                "companySubscriptions.newSubscriptionOnActiveFreeTrial.title",
              ),
            },
            {
              description: tQuestions(
                "companySubscriptionNew.addCard.description",
              ),
              title: tQuestions("companySubscriptionNew.addCard.title"),
            },
            {
              description: tQuestions("companyCard.updateCard.description"),
              title: tQuestions("companyCard.updateCard.title"),
            },
            {
              description: tQuestions(
                "companySubscriptionNew.addCoupon.description",
              ),
              title: tQuestions("companySubscriptionNew.addCoupon.title"),
            },
            {
              description: tQuestions(
                "companySubscriptionNew.validCoupon.description",
              ),
              title: tQuestions("companySubscriptionNew.validCoupon.title"),
            },
            {
              description: tQuestions(
                "companySubscriptionNew.cardError.description",
              ),
              title: tQuestions("companySubscriptionNew.cardError.title"),
            },
          ]}
          size="md"
          title={t("title")}
          warning={user?.company?.freeTrial ? t("warning") : undefined}
          withHTML={false}
          withTextsToUi
        >
          <SelectPlan
            form={form}
            label={t("selectedPlan")}
            plans={plans}
            required
          />
          <Collapse opened={!!foundSelectedPlan}>
            {foundSelectedPlan && (
              <Flex align="center" justify="center" mt={24}>
                <CardPlan {...foundSelectedPlan} />
              </Flex>
            )}
          </Collapse>
          <SwitchCardStripe
            checked={switchCard}
            onChange={handleChangeCardStripe}
          />
          <Title center mt={64} order={2}>
            {t("checkCoupon")}
          </Title>
          <Flex align="center" direction="column" justify="center" pb={24}>
            <Divider
              color={platformColor}
              mb={0}
              mt={8}
              radioGroup="m"
              size={2}
              w="50px"
            />
          </Flex>
          <InputWrapper>
            <Input
              clearable
              form={form}
              key={form.key(formNames.couponPromotionCode)}
              name={formNames.couponPromotionCode}
              required={false}
              withoutDescription
              {...form.getInputProps(formNames.couponPromotionCode)}
            />
            <Flex justify="flex-end" w="100%">
              <Button
                loading={buttonLoading}
                onClick={handleCheckCoupon}
                variant="light"
              >
                {t("buttonCheckCoupon")}
              </Button>
            </Flex>
            <Collapse
              opened={
                !!fetchedCoupon &&
                !!fetcher?.data?.coupon &&
                !buttonLoading &&
                fetcher.state === "idle"
              }
            >
              {fetchedCoupon &&
                fetcher?.data?.coupon &&
                !buttonLoading &&
                fetcher.state === "idle" && (
                  <CardCoupon coupon={fetchedCoupon} />
                )}
            </Collapse>
            <Collapse fullWith opened={!!foundSelectedPlan?.price}>
              <CardSummary
                amount={
                  foundSelectedPlan?.price
                    ? Number(foundSelectedPlan?.price)
                    : 0
                }
                amountOff={
                  fetcher?.data?.coupon?.amountOff
                    ? Number(fetcher?.data?.coupon?.amountOff)
                    : undefined
                }
                discountDurationInMonths={
                  fetcher?.data?.coupon?.durationInMonths ?? undefined
                }
                interval={foundSelectedPlan?.interval ?? undefined}
                intervalCount={foundSelectedPlan?.intervalCount ?? undefined}
                percentOff={fetcher?.data?.coupon?.percentOff ?? undefined}
                pt={48}
              />
            </Collapse>
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

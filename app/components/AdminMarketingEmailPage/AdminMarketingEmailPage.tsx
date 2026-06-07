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
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Checkbox } from "~/ui/Checkbox";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const AdminMarketingEmailPage = () => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { t } = useTranslation(namespaces.adminExchangeNew);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.checkboxExchangeActive]: false,
      [formNames.exchangeName]: "",
      [formNames.exchangePoints]: 0,
      [formNames.exchangeSubscriptionFreeDays]: "",
    },
    mode: "uncontrolled",
    validate: {
      [formNames.checkboxExchangeActive]: value =>
        checkFormValidator({
          formName: formNames.checkboxExchangeActive,
          value,
        }),
      [formNames.exchangeName]: value =>
        checkFormValidator({ formName: formNames.exchangeName, value }),
      [formNames.exchangePoints]: value =>
        checkFormValidator({ formName: formNames.exchangePoints, value }),
      [formNames.exchangeSubscriptionFreeDays]: value =>
        checkFormValidator({
          formName: formNames.exchangeSubscriptionFreeDays,
          value,
        }),
    },
  });

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    const { exchangeSubscriptionFreeDays } = values;

    if (!exchangeSubscriptionFreeDays) {
      notifications.show({
        color: "red",
        message: tNotifications(`exchangeMustHaveSubscriptionFreeDays.message`),
        title: tNotifications(`exchangeMustHaveSubscriptionFreeDays.title`),
      });
      return;
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

      if (!formData) {
        return;
      }

      const { exchangeSubscriptionFreeDays } = formData;

      if (!exchangeSubscriptionFreeDays) {
        notifications.show({
          color: "red",
          message: tNotifications(
            `exchangeMustHaveSubscriptionFreeDays.message`,
          ),
          title: tNotifications(`exchangeMustHaveSubscriptionFreeDays.title`),
        });
        return;
      }

      submit(
        convertToFormData({
          ...formData,
          [formNames.authenticator]: authenticator,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.adminExchangesNew,
          }),
          method: "post",
        },
      );
    },
    [form],
  );

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
            E_Routes.admin,
            E_Routes.adminExchanges,
            E_Routes.adminExchangesNew,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.adminExchanges} />
              <ButtonSave type="submit" />
            </>
          }
          pageMeta={{
            route: E_Routes.adminExchangesNew,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <Input
              key={form.key(formNames.exchangeName)}
              name={formNames.exchangeName}
              required
              {...form.getInputProps(formNames.exchangeName)}
              maxLength={100}
            />
            <Input
              key={form.key(formNames.exchangePoints)}
              name={formNames.exchangePoints}
              required
              {...form.getInputProps(formNames.exchangePoints)}
              type="number"
            />
            <Input
              key={form.key(formNames.exchangeSubscriptionFreeDays)}
              name={formNames.exchangeSubscriptionFreeDays}
              required
              {...form.getInputProps(formNames.exchangeSubscriptionFreeDays)}
              type="number"
            />
            <Checkbox
              key={form.key(formNames.checkboxExchangeActive)}
              name={formNames.checkboxExchangeActive}
              required={false}
              {...form.getInputProps(formNames.checkboxExchangeActive, {
                type: "checkbox",
              })}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

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
import type { T_Exchange } from "~/models/exchange";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Checkbox } from "~/ui/Checkbox";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

type T_AdminExchangeEditPage = {
  exchange: T_Exchange;
};

export const AdminExchangeEditPage = ({
  exchange,
}: T_AdminExchangeEditPage) => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [haveChanges, setHaveChanges] = useState(false);
  const [authenticatorDeleteOpen, setAuthenticatorDeleteOpen] = useState(false);

  const { t } = useTranslation(namespaces.adminExchangeEdit);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const initialValues = {
    [formNames.checkboxExchangeActive]: !!exchange.enabledAt,
    [formNames.exchangeId]: exchange.id,
    [formNames.exchangeName]: exchange.name,
    [formNames.exchangePoints]: exchange.points,
    [formNames.exchangeSubscriptionFreeDays]:
      exchange.subscriptionFreeDays ?? "",
  };

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues,
    mode: "uncontrolled",
    onValuesChange(values) {
      const isDataTheSame = compareObjects({
        object1: values,
        object2: initialValues,
      });
      setHaveChanges(!isDataTheSame);
    },
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
            extraPath: `/${exchange.id}`,
            route: E_Routes.adminExchangesEdit,
          }),
          method: "patch",
        },
      );
    },
    [form],
  );

  const handleDelete = useCallback(() => {
    setAuthenticatorDeleteOpen(true);
  }, []);

  const handleCloseAuthenticatorDelete = useCallback(() => {
    setAuthenticatorDeleteOpen(false);
  }, []);

  const handleAuthenticatorDeletePlanOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorDeleteOpen(false);

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
        }),
        {
          action: getLocalizedRoute({
            extraPath: `/${exchange.id}`,
            route: E_Routes.adminExchangesEdit,
          }),
          method: "delete",
        },
      );
    },
    [form, exchange],
  );

  return (
    <>
      <ModalAuthenticator
        onClose={handleCloseAuthenticatorDelete}
        onSuccess={handleAuthenticatorDeletePlanOnSuccess}
        opened={authenticatorDeleteOpen}
      />
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
            E_Routes.adminExchangesEdit,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.adminExchanges} />
              <Button color="red" onClick={handleDelete} variant="light">
                {t("buttonDelete")}
              </Button>
              <ButtonSave
                disabled={!haveChanges}
                tooltip={{
                  label: tCommon("buttonSaveTooltip"),
                }}
                type="submit"
              />
            </>
          }
          pageMeta={{
            route: E_Routes.adminExchangesEdit,
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

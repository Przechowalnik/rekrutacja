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
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Checkbox } from "~/ui/Checkbox";
import { Form } from "~/ui/Form";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const CompanySettingsPage = () => {
  const [haveChanges, setHaveChanges] = useState(false);
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { user } = useUser();
  const { t } = useTranslation(namespaces.companySettings);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const formDefaultValues = {
    [formNames.companySettingsLoginPassword]:
      !!user?.company?.settings?.loginPasswordAt,
    [formNames.companySettingsTwoFactorAuthenticationEnabled]:
      !!user?.company?.settings?.twoFactorAuthenticationEnabledAt,
  };

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: formDefaultValues,
    mode: "uncontrolled",
    onValuesChange(values) {
      const isDataTheSame = compareObjects({
        object1: values,
        object2: formDefaultValues,
      });
      setHaveChanges(!isDataTheSame);
    },
    validate: {
      [formNames.companySettingsLoginPassword]: value =>
        checkFormValidator({
          formName: formNames.companySettingsLoginPassword,
          optional: true,
          value,
        }),
      [formNames.companySettingsTwoFactorAuthenticationEnabled]: value =>
        checkFormValidator({
          formName: formNames.companySettingsTwoFactorAuthenticationEnabled,
          optional: true,
          value,
        }),
    },
  });

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    const { companySettingsLoginPassword } = values;

    if (!companySettingsLoginPassword) {
      notifications.show({
        color: "red",
        message: tNotifications(`companySettingsRequireLoginForm.message`),
        title: tNotifications(`companySettingsRequireLoginForm.title`),
      });
      return;
    }

    setAuthenticatorOpen(true);
  };

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorOpen(false);

      const formData = form.getValues();

      if (!formData) {
        return;
      }

      const { companySettingsLoginPassword } = formData;

      if (!companySettingsLoginPassword) {
        notifications.show({
          color: "red",
          message: tNotifications(`companySettingsRequireLoginForm.message`),
          title: tNotifications(`companySettingsRequireLoginForm.title`),
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
            route: E_Routes.companySettings,
          }),
          method: "patch",
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
            E_Routes.company,
            E_Routes.companySettings,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.company} />
              <ButtonSave
                disabled={!haveChanges}
                tooltip={{
                  label: tCommon("buttonSaveTooltip"),
                }}
                type="submit"
              />
            </>
          }
          description={t("description")}
          pageMeta={{
            route: E_Routes.companySettings,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <Checkbox
              key={form.key(formNames.companySettingsLoginPassword)}
              name={formNames.companySettingsLoginPassword}
              required={false}
              {...form.getInputProps(formNames.companySettingsLoginPassword, {
                type: "checkbox",
              })}
            />
            <Checkbox
              key={form.key(
                formNames.companySettingsTwoFactorAuthenticationEnabled,
              )}
              name={formNames.companySettingsTwoFactorAuthenticationEnabled}
              required={false}
              {...form.getInputProps(
                formNames.companySettingsTwoFactorAuthenticationEnabled,
                {
                  type: "checkbox",
                },
              )}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { SyntheticEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { formNames } from "~/lib/zodFormValidator";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Form } from "~/ui/Form";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { Switch } from "~/ui/Switch";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

const ModalAccountAuthenticatorShowBackupCode = dynamic(() =>
  import("~/ui/ModalAccountAuthenticatorShowBackupCode").then(module => ({
    default: module.ModalAccountAuthenticatorShowBackupCode,
  })),
);

const ModalAccountAuthenticator2Fa = dynamic(() =>
  import("~/ui/ModalAccountAuthenticator2Fa").then(module => ({
    default: module.ModalAccountAuthenticator2Fa,
  })),
);

export const AccountAuthenticatorPage = () => {
  const [authenticator, setAuthenticator] = useState<number | string>("");
  const [haveChanges, setHaveChanges] = useState(false);
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [authenticator2FAConfigOpen, setAuthenticator2FAConfigOpen] =
    useState(false);

  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t } = useTranslation(namespaces.accountAuthenticator);
  const { user } = useUser();
  const { getLocalizedRoute } = useLocalizedRoute();

  const submit = useSubmitWithActions();
  const actionData = useActionData<{
    backupCode?: string;
    message?: string;
  }>();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.checkboxAuthenticator2FA]: false,
      [formNames.checkboxAuthenticatorEmailOTP]: false,
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      let userAuthenticator2Fa = false;
      let userAuthenticatorEmailOtp = false;
      if (user?.authenticator2FA?.enabledAt) {
        userAuthenticator2Fa = true;
      }
      if (user?.authenticatorEmailOTP?.enabledAt) {
        userAuthenticatorEmailOtp = true;
      }

      if (
        values[formNames.checkboxAuthenticator2FA] !== userAuthenticator2Fa ||
        values[formNames.checkboxAuthenticatorEmailOTP] !==
          userAuthenticatorEmailOtp
      ) {
        setHaveChanges(true);
      } else {
        setHaveChanges(false);
      }
    },
    validate: {},
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    form.setValues({
      [formNames.checkboxAuthenticator2FA]: !!user.authenticator2FA?.enabledAt,
      [formNames.checkboxAuthenticatorEmailOTP]:
        !!user.authenticatorEmailOTP?.enabledAt,
    });
  }, [user]);

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    if (
      values[formNames.checkboxAuthenticator2FA] &&
      values[formNames.checkboxAuthenticatorEmailOTP]
    ) {
      notifications.show({
        color: "red",
        message: tNotifications(`errorsInFormAuthenticator.message`),
        title: tNotifications(`errorsInFormAuthenticator.title`),
      });
      return;
    }

    setAuthenticator("");
    setAuthenticatorOpen(true);
  };

  const handleOnSuccessNew2FACode = (code: string) => {
    setAuthenticator2FAConfigOpen(false);

    submit(
      convertToFormData({
        [formNames.authenticator]: authenticator,
        [formNames.checkboxAuthenticator2FA]:
          formData[formNames.checkboxAuthenticator2FA],
        [formNames.checkboxAuthenticatorEmailOTP]:
          formData[formNames.checkboxAuthenticatorEmailOTP],
        [formNames.code]: code,
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.accountAuthenticator,
        }),
        method: "patch",
      },
    );
  };

  const handleClose2FAModal = useCallback(() => {
    setAuthenticator2FAConfigOpen(false);
  }, []);

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

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

      if (formData[formNames.checkboxAuthenticator2FA]) {
        setAuthenticator(authenticator);
        setAuthenticator2FAConfigOpen(true);
        return;
      }

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.checkboxAuthenticator2FA]:
            formData[formNames.checkboxAuthenticator2FA],
          [formNames.checkboxAuthenticatorEmailOTP]:
            formData[formNames.checkboxAuthenticatorEmailOTP],
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.accountAuthenticator,
          }),
          method: "patch",
        },
      );
    },
    [form, authenticator, submit],
  );

  const formData = form.getValues();

  return (
    <>
      <ModalAccountAuthenticatorShowBackupCode
        backupCode={actionData?.backupCode}
      />
      <ModalAccountAuthenticator2Fa
        onClose={handleClose2FAModal}
        onSuccess={handleOnSuccessNew2FACode}
        opened={authenticator2FAConfigOpen}
      />
      <ModalAuthenticator
        alert={
          user?.authenticator2FA?.enabledAt &&
          formData[formNames.checkboxAuthenticatorEmailOTP]
            ? t("alertToEnableEmailOtpWith2FA")
            : undefined
        }
        onClose={handleCloseAuthenticator}
        onSuccess={handleAuthenticatorOnSuccess}
        opened={authenticatorOpen}
      />
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          breadcrumbs={[
            E_Routes.home,
            E_Routes.account,
            E_Routes.accountAuthenticator,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.account} />
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
            route: E_Routes.accountAuthenticator,
          }}
          questions={[
            {
              description: tQuestions(
                "accountAuthenticator.options2Fa.description",
              ),
              title: tQuestions("accountAuthenticator.options2Fa.title"),
            },
          ]}
          size="md"
          title={t("title")}
          withHTML={false}
          withTextsToUi
        >
          <InputWrapper>
            <Switch
              key={form.key(formNames.checkboxAuthenticatorEmailOTP)}
              name={formNames.checkboxAuthenticatorEmailOTP}
              size="md"
              {...form.getInputProps(formNames.checkboxAuthenticatorEmailOTP, {
                type: "checkbox",
              })}
              mb={24}
            />
            <Switch
              key={form.key(formNames.checkboxAuthenticator2FA)}
              name={formNames.checkboxAuthenticator2FA}
              size="md"
              {...form.getInputProps(formNames.checkboxAuthenticator2FA, {
                type: "checkbox",
              })}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

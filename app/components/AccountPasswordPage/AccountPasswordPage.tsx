import { Box } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { SyntheticEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { PasswordSafeVisualization } from "~/ui/PasswordSafeVisualization";
import { Section } from "~/ui/Section";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const AccountPasswordPage = () => {
  const [haveChanges, setHaveChanges] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [formData, setFormData] = useState<{
    password: string;
    passwordRepeat: string;
  } | null>(null);

  const { t } = useTranslation(namespaces.accountPassword);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();
  const { user } = useUser({
    fetchUserIfNotExist: false,
    requireSession: false,
  });
  const isFirstPasswordSet = user?.isPasswordSet === false;

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.password]: "",
      [formNames.passwordRepeat]: "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      const { password, passwordRepeat } = values;

      setPassword(password);
      setPasswordRepeat(passwordRepeat);
      setHaveChanges(!!password && !!passwordRepeat);
    },
    validate: {},
  });

  useEffect(() => {
    setFormData(null);
  }, []);

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleSubmit = (
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    const passwordErrorMessage = checkFormValidator({
      formName: formNames.password,
      value: password,
    });

    if (passwordErrorMessage) {
      notifications.show({
        color: "red",
        message: "",
        title: tCommon(`formValidator.${passwordErrorMessage}`),
      });
      return;
    }

    const passwordRepeatErrorMessage = checkFormValidator({
      formName: formNames.password,
      value: passwordRepeat,
    });

    if (passwordRepeatErrorMessage) {
      notifications.show({
        color: "red",
        message: "",
        title: tCommon(`formValidator.${passwordRepeatErrorMessage}`),
      });
      return;
    }

    if (isFirstPasswordSet) {
      submit(
        convertToFormData({
          [formNames.password]: password,
          [formNames.passwordRepeat]: passwordRepeat,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.accountPassword,
          }),
          method: "patch",
        },
      );
      return;
    }

    setFormData({
      password: password,
      passwordRepeat: passwordRepeat,
    });

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

      if (!formData) {
        return;
      }

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.password]: formData.password,
          [formNames.passwordRepeat]: formData.passwordRepeat,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.accountPassword,
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
            E_Routes.account,
            E_Routes.accountPassword,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.account} />
              <Button
                disabled={!haveChanges}
                tooltip={{
                  label: tCommon("buttonSaveTooltip"),
                }}
                type="submit"
              >
                {t("buttonUpdatePassword")}
              </Button>
            </>
          }
          description={t("description")}
          pageMeta={{
            route: E_Routes.accountPassword,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <Input
              clearable
              key={form.key(formNames.password)}
              label={t("inputPasswordNew")}
              name={formNames.password}
              required
              type="password"
              {...form.getInputProps(formNames.password)}
            />
            <Input
              clearable
              description={t("inputDescriptionPasswordNewRepeat")}
              key={form.key(formNames.passwordRepeat)}
              label={t("inputPasswordNewRepeat")}
              name={formNames.passwordRepeat}
              required
              type="password"
              {...form.getInputProps(formNames.passwordRepeat)}
            />
          </InputWrapper>
          <Box pt={24} w="100%">
            <PasswordSafeVisualization
              password={password}
              passwordRepeat={passwordRepeat}
            />
          </Box>
        </Section>
      </Form>
    </>
  );
};

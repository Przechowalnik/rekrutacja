import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { type SyntheticEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLayout } from "~/hooks/useLayout";
import { useLoading } from "~/hooks/useLoading";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const AccountDeletePage = () => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t } = useTranslation(namespaces.accountDelete);
  const { logout, user } = useUser();
  const submit = useSubmitWithActions();
  const { platformColor } = useLayout();
  const actionData = useActionData<{
    message?: string;
  }>();
  const { onChangeLoading } = useLoading();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.userFirstName]: "",
    },
    mode: "uncontrolled",
    validate: {
      [formNames.userFirstName]: value =>
        checkFormValidator({ formName: formNames.userFirstName, value }),
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (actionData?.message === "accountDeleted") {
      onChangeLoading({
        duration: 300,
        value: true,
      });
      timer = setTimeout(async () => {
        await logout();
        onChangeLoading({
          duration: 300,
          value: false,
        });
      }, 300);
    }

    return () => clearTimeout(timer);
  }, [actionData]);

  const handleSubmit = (
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
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

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorOpen(false);

      const values = form.getValues();

      if (!values[formNames.userFirstName]) {
        notifications.show({
          color: "red",
          message: tNotifications(`somethingWentWrong.message`),
          title: tNotifications(`somethingWentWrong.title`),
        });
        return;
      }

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.userFirstName]: values[formNames.userFirstName],
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.accountDelete,
          }),
          method: "delete",
        },
      );
    },
    [form, submit, tNotifications],
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
            E_Routes.accountDelete,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.account} />
              <Button color="red" type="submit" variant="filled">
                {t("buttonSave")}
              </Button>
            </>
          }
          description={t("description")}
          pageMeta={{
            route: E_Routes.accountDelete,
          }}
          size="md"
          title={t("title")}
        >
          <Text center fw="bold">
            {t("textToDelete")}
          </Text>
          <Text c={platformColor} center fw="bold" mb={48} span>
            {user?.firstName}
          </Text>
          <InputWrapper>
            <Input
              key={form.key(formNames.userFirstName)}
              name={formNames.userFirstName}
              required
              {...form.getInputProps(formNames.userFirstName)}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

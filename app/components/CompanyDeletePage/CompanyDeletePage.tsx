import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { type SyntheticEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLayout } from "~/hooks/useLayout";
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

export const CompanyDeletePage = () => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t } = useTranslation(namespaces.companyDelete);
  const { user } = useUser();
  const { platformColor } = useLayout();
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const linkCurrent = `${getLocalizedRoute({
    route: E_Routes.companyDelete,
  })}`;

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
          action: linkCurrent,
          method: "delete",
        },
      );
    },
    [form],
  );

  if (!user) {
    return null;
  }

  return (
    <>
      <ModalAuthenticator
        onClose={handleCloseAuthenticator}
        onSuccess={handleAuthenticatorOnSuccess}
        opened={authenticatorOpen}
      />
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          alert={t("alert")}
          breadcrumbs={[
            E_Routes.home,
            E_Routes.company,
            E_Routes.companyDelete,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.company} textGoBack />
              <Button color="red" type="submit" variant="filled">
                {t("buttonDelete")}
              </Button>
            </>
          }
          description={t("description")}
          pageMeta={{
            route: E_Routes.companyDelete,
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

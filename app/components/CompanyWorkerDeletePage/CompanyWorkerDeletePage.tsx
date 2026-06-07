import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { type SyntheticEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes, routesExtra } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useCompanyWorker } from "~/hooks/useCompanyWorker";
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
import { Link } from "~/ui/Link";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const CompanyWorkerDeletePage = () => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t } = useTranslation(namespaces.companyWorkerDelete);
  const { companyWorker } = useCompanyWorker();
  const { user } = useUser();
  const submit = useSubmitWithActions();
  const { platformColor } = useLayout();
  const { getLocalizedRoute } = useLocalizedRoute();

  const linkGoBack = getLocalizedRoute({
    extraPath: `/${companyWorker?.id}`,
    route: E_Routes.companyWorkerEdit,
  });

  const linkCurrent = getLocalizedRoute({
    extraPath: `/${companyWorker?.id}${routesExtra[E_Routes.companyWorkerEdit].delete}`,
    route: E_Routes.companyWorkerEdit,
  });

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

  if (!companyWorker || !user) {
    return null;
  }

  if (companyWorker.id === user.id) {
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
            E_Routes.companyWorkers,
            {
              customHref: linkGoBack,
              customTitle: `${companyWorker.firstName}${companyWorker.lastName ? ` ${companyWorker.lastName.at(0)}.` : ""}`,
            },
            {
              customHref: linkCurrent,
              customTitle: tCommon("breadcrumbs.companyWorkerEditPermissions"),
            },
          ]}
          buttons={
            <>
              <Link fullWidthOnMobile to={linkGoBack}>
                <ButtonArrowLeft textGoBack />
              </Link>
              <Button color="red" type="submit" variant="filled">
                {t("buttonDelete")}
              </Button>
            </>
          }
          description={t("description")}
          pageMeta={{
            route: E_Routes.companyWorkerEdit,
          }}
          size="md"
          title={t("title")}
        >
          <Text center fw="bold">
            {t("textToDelete")}
          </Text>
          <Text c={platformColor} center fw="bold" mb={48} span>
            {companyWorker?.firstName}
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

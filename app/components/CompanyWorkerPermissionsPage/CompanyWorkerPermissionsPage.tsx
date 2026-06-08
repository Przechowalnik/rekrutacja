import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import type { SyntheticEvent } from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes, routesExtra } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useCompanyWorker } from "~/hooks/useCompanyWorker";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Form } from "~/ui/Form";
import { InputWrapper } from "~/ui/InputWrapper";
import { Link } from "~/ui/Link";
import { Section } from "~/ui/Section";
import { SelectMultipleWorkerPermissions } from "~/ui/SelectMultipleWorkerPermissions";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { arraysEqual } from "~/utilities/functions";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const CompanyWorkerPermissionsPage = () => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [haveChanges, setHaveChanges] = useState(false);

  const { user } = useUser();
  const { companyWorker } = useCompanyWorker();
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t } = useTranslation(namespaces.companyWorkerPermissions);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const linkGoBack = getLocalizedRoute({
    extraPath: `/${companyWorker?.id}`,
    route: E_Routes.companyWorkerEdit,
  });

  const linkCurrent = getLocalizedRoute({
    extraPath: `/${companyWorker?.id}${routesExtra[E_Routes.companyWorkerEdit].permissions}`,
    route: E_Routes.companyWorkerEdit,
  });

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.companyWorkerPermission]:
        companyWorker?.workerSettings?.permissions ?? [],
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      const isDataTheSame = arraysEqual({
        array1: values[formNames.companyWorkerPermission],
        array2: companyWorker?.workerSettings?.permissions ?? [],
      });

      setHaveChanges(!isDataTheSame);
    },
    validate: {
      [formNames.companyWorkerPermission]: value =>
        checkFormValidator({
          formName: formNames.companyWorkerPermission,
          optional: true,
          value,
        }),
    },
  });

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleSubmit = useCallback(
    (_values: typeof form.values, event: SyntheticEvent | undefined) => {
      event?.preventDefault();

      setAuthenticatorOpen(true);
    },
    [user],
  );

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

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          ...formData,
        }),
        {
          action: linkCurrent,
          method: "patch",
        },
      );
    },
    [form, user],
  );

  if (!companyWorker) {
    return;
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
                <ButtonArrowLeft />
              </Link>
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
            route: E_Routes.companyWorkerEdit,
          }}
          questions={[
            {
              description: tQuestions(
                "companyWorkerPermissions.permissionInformation.description",
              ),
              title: tQuestions(
                "companyWorkerPermissions.permissionInformation.title",
              ),
            },
          ]}
          size="md"
          title={t("title")}
          withHTML={false}
          withTextsToUi
        >
          <InputWrapper>
            <SelectMultipleWorkerPermissions form={form} />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

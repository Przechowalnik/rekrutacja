import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
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
import type { T_CompanyProfile } from "~/models/company/companyProfile";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { Textarea } from "~/ui/Textarea";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

type T_CompanyProfileEditPage = {
  companyProfile: T_CompanyProfile;
};

export const CompanyProfileEditPage = ({
  companyProfile,
}: T_CompanyProfileEditPage) => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [haveChanges, setHaveChanges] = useState(false);

  const { t } = useTranslation(namespaces.companyProfileEdit);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { user } = useUser();
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const formDefaultValues = {
    [formNames.companyDescription]: companyProfile?.description ?? "",
    [formNames.companyName]: user?.company?.name ?? "",
    [formNames.urlFacebook]: companyProfile?.urlFacebook ?? "",
    [formNames.urlInstagram]: companyProfile?.urlInstagram ?? "",
    [formNames.urlTiktok]: companyProfile?.urlTiktok ?? "",
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
      [formNames.companyDescription]: value =>
        checkFormValidator({
          formName: formNames.companyDescription,
          optional: true,
          value,
        }),
      [formNames.companyName]: value =>
        checkFormValidator({
          formName: formNames.companyName,
          value,
        }),
      [formNames.urlFacebook]: value =>
        checkFormValidator({
          formName: formNames.urlFacebook,
          optional: true,
          value,
        }),
      [formNames.urlInstagram]: value =>
        checkFormValidator({
          formName: formNames.urlInstagram,
          optional: true,
          value,
        }),
      [formNames.urlTiktok]: value =>
        checkFormValidator({
          formName: formNames.urlTiktok,
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
    [],
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
          action: getLocalizedRoute({
            route: E_Routes.companyProfileEdit,
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
            E_Routes.companyProfile,
            E_Routes.companyProfileEdit,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.companyProfile} />
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
            route: E_Routes.companyProfileEdit,
          }}
          size="md"
          title={t("title")}
          warning={t("warning")}
        >
          <InputWrapper>
            <Input
              clearable
              form={form}
              key={form.key(formNames.companyName)}
              name={formNames.companyName}
              required
              type="text"
              {...form.getInputProps(formNames.companyName)}
              maxLength={50}
            />
            <Input
              clearable
              form={form}
              key={form.key(formNames.urlInstagram)}
              name={formNames.urlInstagram}
              required={false}
              type="url"
              {...form.getInputProps(formNames.urlInstagram)}
            />
            <Input
              clearable
              form={form}
              key={form.key(formNames.urlFacebook)}
              name={formNames.urlFacebook}
              required={false}
              type="url"
              {...form.getInputProps(formNames.urlFacebook)}
            />
            <Input
              clearable
              form={form}
              key={form.key(formNames.urlTiktok)}
              name={formNames.urlTiktok}
              required={false}
              type="url"
              {...form.getInputProps(formNames.urlTiktok)}
            />
            <Textarea
              name={formNames.companyDescription}
              {...form.getInputProps(formNames.companyDescription)}
              key={form.key(formNames.companyDescription)}
              maxLength={1000}
              required={false}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

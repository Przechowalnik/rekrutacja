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
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
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

export const AdminProductNewPage = () => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { t } = useTranslation(namespaces.adminProductNew);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.productPoints_1]: "",
      [formNames.productPoints_2_5]: "",
      [formNames.productPoints_6_plus]: "",
      [formNames.productPrice_1]: "",
      [formNames.productPrice_2_5]: "",
      [formNames.productPrice_6_plus]: "",
    },
    mode: "uncontrolled",
    validate: {
      [formNames.productPoints_1]: value =>
        checkFormValidator({
          formName: formNames.productPoints_1,
          value,
        }),
      [formNames.productPoints_2_5]: value =>
        checkFormValidator({
          formName: formNames.productPoints_2_5,
          value,
        }),
      [formNames.productPoints_6_plus]: value =>
        checkFormValidator({
          formName: formNames.productPoints_6_plus,
          value,
        }),
      [formNames.productPrice_1]: value =>
        checkFormValidator({
          formName: formNames.productPrice_1,
          value,
        }),
      [formNames.productPrice_2_5]: value =>
        checkFormValidator({
          formName: formNames.productPrice_2_5,
          value,
        }),
      [formNames.productPrice_6_plus]: value =>
        checkFormValidator({
          formName: formNames.productPrice_6_plus,
          value,
        }),
    },
  });

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

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

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorOpen(false);

      const formData = form.getValues();

      if (!formData) {
        return;
      }

      const {
        productPoints_1,
        productPoints_2_5,
        productPoints_6_plus,
        productPrice_1,
        productPrice_2_5,
        productPrice_6_plus,
      } = formData;

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.productPoints_1]: productPoints_1,
          [formNames.productPoints_2_5]: productPoints_2_5,
          [formNames.productPoints_6_plus]: productPoints_6_plus,
          [formNames.productPrice_1]: productPrice_1,
          [formNames.productPrice_2_5]: productPrice_2_5,
          [formNames.productPrice_6_plus]: productPrice_6_plus,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.adminProductsNew,
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
            E_Routes.adminProducts,
            E_Routes.adminProductsNew,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.adminProducts} />
              <ButtonSave type="submit" />
            </>
          }
          pageMeta={{
            route: E_Routes.adminProductsNew,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <Input
              key={form.key(formNames.productPrice_1)}
              name={formNames.productPrice_1}
              required
              type="number"
              {...form.getInputProps(formNames.productPrice_1)}
            />
            <Input
              key={form.key(formNames.productPrice_2_5)}
              name={formNames.productPrice_2_5}
              required
              type="number"
              {...form.getInputProps(formNames.productPrice_2_5)}
            />
            <Input
              key={form.key(formNames.productPrice_6_plus)}
              name={formNames.productPrice_6_plus}
              required
              type="number"
              {...form.getInputProps(formNames.productPrice_6_plus)}
            />
            <Input
              key={form.key(formNames.productPoints_1)}
              name={formNames.productPoints_1}
              required
              type="number"
              {...form.getInputProps(formNames.productPoints_1)}
            />
            <Input
              key={form.key(formNames.productPoints_2_5)}
              name={formNames.productPoints_2_5}
              required
              type="number"
              {...form.getInputProps(formNames.productPoints_2_5)}
            />
            <Input
              key={form.key(formNames.productPoints_6_plus)}
              name={formNames.productPoints_6_plus}
              required
              type="number"
              {...form.getInputProps(formNames.productPoints_6_plus)}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

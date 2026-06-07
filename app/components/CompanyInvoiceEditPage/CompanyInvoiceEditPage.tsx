import { Box, Flex } from "@mantine/core";
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
import type { T_CompanyInvoiceData } from "~/models/company/companyInvoiceData";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputCountry } from "~/ui/InputCountry";
import { InputPostalCode } from "~/ui/InputPostalCode";
import { InputTax } from "~/ui/InputTax";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

type T_CompanyInvoiceEditPage = {
  companyInvoiceData: T_CompanyInvoiceData;
};

export const CompanyInvoiceEditPage = ({
  companyInvoiceData,
}: T_CompanyInvoiceEditPage) => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [haveChanges, setHaveChanges] = useState(false);

  const { t } = useTranslation(namespaces.companyInvoiceEdit);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const formDefaultValues = {
    [formNames.city]: companyInvoiceData?.city ?? "",
    [formNames.companyName]: companyInvoiceData?.companyName ?? "",
    [formNames.country]: companyInvoiceData?.country?.toUpperCase() ?? "",
    [formNames.flatNumber]: companyInvoiceData?.flatNumber ?? "",
    [formNames.postalCode]: companyInvoiceData?.postalCode ?? "",
    [formNames.streetName]: companyInvoiceData?.streetName ?? "",
    [formNames.streetNumber]: companyInvoiceData?.streetNumber ?? "",
    [formNames.taxCountry]: companyInvoiceData?.taxCountry?.toUpperCase() ?? "",
    [formNames.taxNumber]: companyInvoiceData?.taxNumber
      ? Number(companyInvoiceData?.taxNumber)
      : "",
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
      [formNames.city]: value =>
        checkFormValidator({
          formName: formNames.city,
          value,
        }),
      [formNames.companyName]: value =>
        checkFormValidator({
          formName: formNames.companyName,
          value,
        }),
      [formNames.country]: value =>
        checkFormValidator({
          formName: formNames.country,
          value,
        }),
      [formNames.flatNumber]: value =>
        checkFormValidator({
          formName: formNames.flatNumber,
          optional: true,
          value,
        }),
      [formNames.postalCode]: value =>
        checkFormValidator({
          formName: formNames.postalCode,
          value,
        }),
      [formNames.streetName]: value =>
        checkFormValidator({
          formName: formNames.streetName,
          value,
        }),
      [formNames.streetNumber]: value =>
        checkFormValidator({
          formName: formNames.streetNumber,
          value,
        }),
      [formNames.taxCountry]: value =>
        checkFormValidator({
          formName: formNames.taxCountry,
          value,
        }),
      [formNames.taxNumber]: value =>
        checkFormValidator({
          formName: formNames.taxNumber,
          value,
        }),
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
            route: E_Routes.companyInvoiceEdit,
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
          alert={t("alert")}
          breadcrumbs={[
            E_Routes.home,
            E_Routes.company,
            E_Routes.companyInvoices,
            E_Routes.companyInvoiceEdit,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.companyInvoices} />
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
            route: E_Routes.companyInvoiceEdit,
          }}
          size="md"
          title={t("title")}
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
            <Flex
              align="center"
              gap={24}
              styles={{
                root: {
                  position: "relative",
                },
              }}
              w="100%"
              wrap="wrap"
            >
              <Box
                w={{
                  base: "100%",
                  xs: "calc(50% - 12px)",
                }}
              >
                <InputCountry form={form} />
              </Box>
              <Box
                w={{
                  base: "100%",
                  xs: "calc(50% - 12px)",
                }}
              >
                <InputPostalCode
                  clearable
                  form={form}
                  key={form.key(formNames.postalCode)}
                  name={formNames.postalCode}
                  required
                  {...form.getInputProps(formNames.postalCode)}
                />
              </Box>
            </Flex>
            <Input
              clearable
              form={form}
              key={form.key(formNames.city)}
              name={formNames.city}
              required
              type="text"
              {...form.getInputProps(formNames.city)}
            />
            <Flex
              align="center"
              gap={24}
              w="100%"
              wrap={{
                base: "wrap",
                xs: "nowrap",
              }}
            >
              <Box
                w={{
                  base: "100%",
                  xs: "calc(33% - 14px)",
                }}
              >
                <Input
                  clearable
                  form={form}
                  key={form.key(formNames.streetName)}
                  name={formNames.streetName}
                  required
                  type="text"
                  {...form.getInputProps(formNames.streetName)}
                />
              </Box>
              <Box
                w={{
                  base: "100%",
                  xs: "calc(33% - 14px)",
                }}
              >
                <Input
                  clearable
                  form={form}
                  key={form.key(formNames.streetNumber)}
                  name={formNames.streetNumber}
                  required
                  type="text"
                  {...form.getInputProps(formNames.streetNumber)}
                />
              </Box>
              <Box
                w={{
                  base: "100%",
                  xs: "calc(33% - 14px)",
                }}
              >
                <Input
                  clearable
                  form={form}
                  key={form.key(formNames.flatNumber)}
                  name={formNames.flatNumber}
                  required={false}
                  type="text"
                  {...form.getInputProps(formNames.flatNumber)}
                />
              </Box>
            </Flex>
            <InputTax form={form} required />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

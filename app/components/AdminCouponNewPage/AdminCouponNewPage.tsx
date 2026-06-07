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
import type { T_Plans } from "~/models/plans";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Checkbox } from "~/ui/Checkbox";
import { DateTimePicker } from "~/ui/DateTimePicker";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { SelectMultipleBadge } from "~/ui/SelectMultipleBadge";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

type T_AdminCouponNewPage = {
  plans: T_Plans;
};

export const AdminCouponNewPage = ({ plans }: T_AdminCouponNewPage) => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { t } = useTranslation(namespaces.adminCouponNew);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.checkboxCouponActive]: false,
      [formNames.couponAmountOff]: "",
      [formNames.couponDurationInMonths]: 1,
      [formNames.couponEndDate]: "",
      [formNames.couponFirstTimeTransaction]: false,
      [formNames.couponMaxRedemptions]: "",
      [formNames.couponMinimumAmount]: "",
      [formNames.couponName]: "",
      [formNames.couponPercentOff]: "",
      [formNames.couponPromotionCode]: "",
      [formNames.plansId]: [],
    },
    mode: "uncontrolled",
    validate: {
      [formNames.checkboxCouponActive]: value =>
        checkFormValidator({
          formName: formNames.checkboxCouponActive,
          value,
        }),
      [formNames.couponAmountOff]: value =>
        checkFormValidator({
          formName: formNames.couponAmountOff,
          optional: true,
          value,
        }),
      [formNames.couponDurationInMonths]: value =>
        checkFormValidator({
          formName: formNames.couponDurationInMonths,
          value,
        }),
      [formNames.couponEndDate]: value =>
        checkFormValidator({
          formName: formNames.couponEndDate,
          value,
        }),
      [formNames.couponFirstTimeTransaction]: value =>
        checkFormValidator({
          formName: formNames.couponFirstTimeTransaction,
          value,
        }),
      [formNames.couponMaxRedemptions]: value =>
        checkFormValidator({
          formName: formNames.couponMaxRedemptions,
          optional: true,
          value,
        }),
      [formNames.couponMinimumAmount]: value =>
        checkFormValidator({
          formName: formNames.couponMinimumAmount,
          optional: true,
          value,
        }),
      [formNames.couponName]: value =>
        checkFormValidator({ formName: formNames.couponName, value }),
      [formNames.couponPercentOff]: value =>
        checkFormValidator({
          formName: formNames.couponPercentOff,
          optional: true,
          value,
        }),
      [formNames.couponPromotionCode]: value =>
        checkFormValidator({ formName: formNames.couponPromotionCode, value }),
      [formNames.plansId]: value =>
        checkFormValidator({ formName: formNames.plansId, value }),
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

      submit(
        convertToFormData({
          ...formData,
          [formNames.authenticator]: authenticator,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.adminCouponNew,
          }),
          method: "post",
        },
      );
    },
    [form],
  );

  const mapPlansToOptions = plans?.map(item => {
    return {
      label: item.name,
      value: item.id,
    };
  });

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
            E_Routes.adminCoupons,
            E_Routes.adminCouponNew,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.adminCoupons} />
              <ButtonSave type="submit" />
            </>
          }
          pageMeta={{
            route: E_Routes.adminCouponNew,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <Input
              key={form.key(formNames.couponName)}
              name={formNames.couponName}
              required
              {...form.getInputProps(formNames.couponName)}
            />
            <Input
              key={form.key(formNames.couponPromotionCode)}
              name={formNames.couponPromotionCode}
              required
              {...form.getInputProps(formNames.couponPromotionCode)}
            />
            <SelectMultipleBadge
              key={form.key(formNames.plansId)}
              name={formNames.plansId}
              options={mapPlansToOptions}
              required
              {...form.getInputProps(formNames.plansId)}
            />
            <Input
              key={form.key(formNames.couponPercentOff)}
              name={formNames.couponPercentOff}
              required={false}
              type="number"
              {...form.getInputProps(formNames.couponPercentOff)}
            />
            <Input
              key={form.key(formNames.couponAmountOff)}
              name={formNames.couponAmountOff}
              required={false}
              type="number"
              {...form.getInputProps(formNames.couponAmountOff)}
            />
            <Input
              key={form.key(formNames.couponMinimumAmount)}
              name={formNames.couponMinimumAmount}
              required={false}
              type="number"
              {...form.getInputProps(formNames.couponMinimumAmount)}
            />
            <Input
              key={form.key(formNames.couponDurationInMonths)}
              name={formNames.couponDurationInMonths}
              required
              type="number"
              {...form.getInputProps(formNames.couponDurationInMonths)}
            />
            <Input
              key={form.key(formNames.couponMaxRedemptions)}
              name={formNames.couponMaxRedemptions}
              required={false}
              type="number"
              {...form.getInputProps(formNames.couponMaxRedemptions)}
            />
            <DateTimePicker
              key={form.key(formNames.couponEndDate)}
              name={formNames.couponEndDate}
              {...form.getInputProps(formNames.couponEndDate, {
                type: "checkbox",
              })}
            />
            <Checkbox
              key={form.key(formNames.couponFirstTimeTransaction)}
              name={formNames.couponFirstTimeTransaction}
              required={false}
              {...form.getInputProps(formNames.couponFirstTimeTransaction, {
                type: "checkbox",
              })}
            />
            <Checkbox
              key={form.key(formNames.checkboxCouponActive)}
              name={formNames.checkboxCouponActive}
              required={false}
              {...form.getInputProps(formNames.checkboxCouponActive, {
                type: "checkbox",
              })}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

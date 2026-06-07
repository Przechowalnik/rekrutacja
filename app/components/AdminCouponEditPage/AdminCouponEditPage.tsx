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
import type { T_Coupon } from "~/models/coupon";
import { Button } from "~/ui/Button";
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

type T_AdminCouponEditPage = {
  coupon: T_Coupon;
};

export const AdminCouponEditPage = ({ coupon }: T_AdminCouponEditPage) => {
  const [haveChanges, setHaveChanges] = useState(false);
  const [authenticatorDeletePlanOpen, setAuthenticatorDeletePlanOpen] =
    useState(false);
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { t } = useTranslation(namespaces.adminCouponEdit);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.checkboxCouponActive]: !!coupon.enabledAt,
      [formNames.couponId]: coupon.id,
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      setHaveChanges(
        values[formNames.checkboxCouponActive] !== !!coupon.enabledAt,
      );
    },
    validate: {
      [formNames.checkboxCouponActive]: value =>
        checkFormValidator({
          formName: formNames.checkboxCouponActive,
          value,
        }),
    },
  });

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleCloseAuthenticatorDeletePlan = useCallback(() => {
    setAuthenticatorDeletePlanOpen(false);
  }, []);

  const handleDeletePlan = useCallback(() => {
    setAuthenticatorDeletePlanOpen(true);
  }, []);

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleSubmit = (
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    setAuthenticatorOpen(true);
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
            extraPath: `/${coupon.id}`,
            route: E_Routes.adminCouponEdit,
          }),
          method: "patch",
        },
      );
    },
    [form],
  );

  const handleAuthenticatorDeletePlanOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorDeletePlanOpen(false);

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.couponId]: coupon.id,
        }),
        {
          action: getLocalizedRoute({
            extraPath: `/${coupon.id}`,
            route: E_Routes.adminCouponEdit,
          }),
          method: "delete",
        },
      );
    },
    [form],
  );

  const mapPlansToOptions =
    coupon?.plans?.map(item => {
      return {
        label: item.name,
        value: item.id,
      };
    }) ?? [];

  return (
    <>
      <ModalAuthenticator
        onClose={handleCloseAuthenticatorDeletePlan}
        onSuccess={handleAuthenticatorDeletePlanOnSuccess}
        opened={authenticatorDeletePlanOpen}
      />
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
            E_Routes.adminCouponEdit,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.adminCoupons} />
              <Button color="red" onClick={handleDeletePlan} variant="light">
                {t("buttonDelete")}
              </Button>
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
            route: E_Routes.adminCouponEdit,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <Input
              disabled
              disabledWithOpacity={false}
              maxLength={40}
              name={formNames.couponName}
              required={false}
              value={coupon.name}
            />
            <Input
              disabled
              maxLength={20}
              name={formNames.couponPromotionCode}
              required={false}
              value={coupon.promotionCode}
            />
            <SelectMultipleBadge
              defaultValue={coupon?.plans?.map(item => item.id) ?? []}
              disabled
              name={formNames.plansId}
              options={mapPlansToOptions}
              required={false}
            />
            <Input
              disabled
              name={formNames.couponPercentOff}
              required={false}
              value={coupon.percentOff ? coupon.percentOff?.toString() : ""}
            />
            <Input
              disabled
              name={formNames.couponAmountOff}
              required={false}
              value={coupon.amountOff ? coupon.amountOff?.toString() : ""}
            />
            <Input
              disabled
              name={formNames.couponMinimumAmount}
              required={false}
              value={
                coupon.minimumAmount ? coupon.minimumAmount?.toString() : ""
              }
            />
            <Input
              disabled
              name={formNames.couponDurationInMonths}
              required={false}
              value={coupon.durationInMonths}
            />
            <Input
              disabled
              name={formNames.couponMaxRedemptions}
              required={false}
              value={
                coupon.maxRedemptions ? coupon.maxRedemptions?.toString() : ""
              }
            />
            <DateTimePicker
              disabled
              name={formNames.couponEndDate}
              required={false}
              value={new Date(coupon.endDate ?? "")}
            />
            <Checkbox
              checked={coupon.firstTimeTransaction}
              disabled
              name={formNames.couponFirstTimeTransaction}
              required={false}
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

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
import { E_PlanType } from "~/models/enums";
import type { T_Plan } from "~/models/plan";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Checkbox } from "~/ui/Checkbox";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { SelectPlanInterval } from "~/ui/SelectPlanInterval";
import { SelectPlanType } from "~/ui/SelectPlanType";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";
import { formatAmountToNumber } from "~/utilities/price";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

type T_AdminPlanEditPage = {
  plan: T_Plan;
};

export const AdminPlanEditPage = ({ plan }: T_AdminPlanEditPage) => {
  const [haveChanges, setHaveChanges] = useState(false);
  const [authenticatorDeletePlanOpen, setAuthenticatorDeletePlanOpen] =
    useState(false);
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { t } = useTranslation(namespaces.adminPlanEdit);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const isTrialPlanType = plan.type === E_PlanType.TRIAL;

  const initialValues = {
    [formNames.checkboxPlanActive]: !!plan.enabledAt,
    [formNames.planId]: plan.id,
    [formNames.planListingDurationMonths]: plan.listingDurationMonths,
    [formNames.planMaximumListingsInMonth]: plan.maximumListingsInMonth,
    [formNames.planPrice]: formatAmountToNumber(plan.price),
  };

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues,
    mode: "uncontrolled",
    onValuesChange(values) {
      const isDataTheSame = compareObjects({
        ignoreCaseInsensitive: false,
        object1: values,
        object2: initialValues,
      });
      setHaveChanges(!isDataTheSame);
    },
    validate: {
      [formNames.checkboxPlanActive]: value =>
        checkFormValidator({
          formName: formNames.checkboxPlanActive,
          value,
        }),
      [formNames.planListingDurationMonths]: value =>
        checkFormValidator({
          formName: formNames.planListingDurationMonths,
          value,
        }),
      [formNames.planMaximumListingsInMonth]: value =>
        checkFormValidator({
          formName: formNames.planMaximumListingsInMonth,
          value,
        }),
      [formNames.planPrice]: value =>
        checkFormValidator({
          formName: formNames.planPrice,
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
          [formNames.authenticator]: authenticator,
          [formNames.checkboxPlanActive]: formData.checkboxPlanActive,
          [formNames.planId]: formData.planId,
          [formNames.planListingDurationMonths]:
            formData.planListingDurationMonths,
          [formNames.planMaximumListingsInMonth]:
            formData.planMaximumListingsInMonth,
          ...(plan.type === E_PlanType.TRIAL
            ? {}
            : {
                [formNames.planPrice]: formData.planPrice,
              }),
        }),
        {
          action: getLocalizedRoute({
            extraPath: `/${plan.id}`,
            route: E_Routes.adminPlansEdit,
          }),
          method: "patch",
        },
      );
    },
    [form, plan, isTrialPlanType],
  );

  const handleAuthenticatorDeletePlanOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorDeletePlanOpen(false);

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.planId]: plan.id,
        }),
        {
          action: getLocalizedRoute({
            extraPath: `/${plan.id}`,
            route: E_Routes.adminPlansEdit,
          }),
          method: "delete",
        },
      );
    },
    [form, plan],
  );

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
            E_Routes.adminPlans,
            E_Routes.adminPlansEdit,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.adminPlans} />
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
            route: E_Routes.adminPlansEdit,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <SelectPlanType
              defaultValue={plan.type}
              disabled
              disabledWithOpacity={false}
              required={false}
            />
            <Input
              disabled
              disabledWithOpacity={false}
              name={formNames.planName}
              required={false}
              value={plan.name}
            />
            <Input
              disabled
              disabledWithOpacity={false}
              name={formNames.planDescription}
              required={false}
              value={plan.description}
            />
            <Input
              key={form.key(formNames.planMaximumListingsInMonth)}
              {...form.getInputProps(formNames.planMaximumListingsInMonth)}
              disabledWithOpacity={false}
              name={formNames.planMaximumListingsInMonth}
              required
              type="number"
            />
            <Input
              key={form.key(formNames.planListingDurationMonths)}
              {...form.getInputProps(formNames.planListingDurationMonths)}
              disabledWithOpacity={false}
              name={formNames.planListingDurationMonths}
              required
              type="number"
            />
            {!isTrialPlanType && (
              <>
                <Input
                  key={form.key(formNames.planPrice)}
                  name={formNames.planPrice}
                  required
                  type="number"
                  {...form.getInputProps(formNames.planPrice)}
                  disabled={isTrialPlanType}
                  disabledWithOpacity={false}
                />
                <SelectPlanInterval
                  disabled
                  disabledWithOpacity={false}
                  required={false}
                />
                {typeof plan?.intervalCount === "number" && (
                  <Input
                    disabled
                    disabledWithOpacity={false}
                    name={formNames.planIntervalCount}
                    required={false}
                    type="number"
                    value={plan.intervalCount}
                  />
                )}
                <Checkbox
                  disabled={isTrialPlanType}
                  disabledWithOpacity={false}
                  key={form.key(formNames.checkboxPlanActive)}
                  name={formNames.checkboxPlanActive}
                  required={false}
                  {...form.getInputProps(formNames.checkboxPlanActive, {
                    type: "checkbox",
                  })}
                />
              </>
            )}
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

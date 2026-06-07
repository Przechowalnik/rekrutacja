import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
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
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Checkbox } from "~/ui/Checkbox";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { SelectPlanInterval } from "~/ui/SelectPlanInterval";
import { SelectPlanType } from "~/ui/SelectPlanType";
import { Textarea } from "~/ui/Textarea";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const AdminPlanNewPage = () => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [isTrialPlan, setIsTrialPlan] = useState(false);

  const { t } = useTranslation(namespaces.adminPlanNew);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.checkboxPlanActive]: false,
      [formNames.planDescription]: "",
      [formNames.planInterval]: "",
      [formNames.planIntervalCount]: 1,
      [formNames.planListingDurationMonths]: "",
      [formNames.planMaximumListingsInMonth]: "",
      [formNames.planName]: "",
      [formNames.planPrice]: "",
      [formNames.planType]: "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      setIsTrialPlan(values[formNames.planType] === E_PlanType.TRIAL);
    },
    validate: {
      [formNames.checkboxPlanActive]: value =>
        checkFormValidator({
          formName: formNames.checkboxPlanActive,
          optional: true,
          value,
        }),
      [formNames.planDescription]: value =>
        checkFormValidator({ formName: formNames.planDescription, value }),
      [formNames.planInterval]: value =>
        checkFormValidator({
          formName: formNames.planInterval,
          optional: true,
          value,
        }),
      [formNames.planIntervalCount]: value =>
        checkFormValidator({
          formName: formNames.planIntervalCount,
          optional: true,
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
      [formNames.planName]: value =>
        checkFormValidator({ formName: formNames.planName, value }),
      [formNames.planPrice]: value =>
        checkFormValidator({
          formName: formNames.planPrice,
          optional: true,
          value,
        }),
      [formNames.planType]: value =>
        checkFormValidator({ formName: formNames.planType, value }),
    },
  });

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    const {
      checkboxPlanActive,
      planInterval,
      planIntervalCount,
      planPrice,
      planType,
    } = values;
    if (
      planType !== E_PlanType.TRIAL &&
      (!planPrice ||
        !planIntervalCount ||
        !planInterval ||
        typeof checkboxPlanActive !== "boolean")
    ) {
      notifications.show({
        color: "red",
        message: tNotifications(`somethingWentWrong.message`),
        title: tNotifications(`somethingWentWrong.title`),
      });
      return;
    }

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
        checkboxPlanActive,
        planDescription,
        planInterval,
        planIntervalCount,
        planListingDurationMonths,
        planMaximumListingsInMonth,
        planName,
        planPrice,
        planType,
      } = formData;

      if (
        planType !== E_PlanType.TRIAL &&
        (!planPrice ||
          !planIntervalCount ||
          !planInterval ||
          typeof checkboxPlanActive !== "boolean")
      ) {
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
          [formNames.planDescription]: planDescription,
          [formNames.planListingDurationMonths]: planListingDurationMonths,
          [formNames.planMaximumListingsInMonth]: planMaximumListingsInMonth,
          [formNames.planName]: planName,
          [formNames.planType]: planType,
          ...(planType === E_PlanType.TRIAL
            ? {}
            : {
                [formNames.checkboxPlanActive]: checkboxPlanActive,
                [formNames.planInterval]: planInterval ?? null,
                [formNames.planIntervalCount]: planIntervalCount,
                [formNames.planPrice]: planPrice,
              }),
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.adminPlanNew,
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
            E_Routes.adminPlans,
            E_Routes.adminPlanNew,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.adminPlans} />
              <ButtonSave type="submit" />
            </>
          }
          pageMeta={{
            route: E_Routes.adminPlanNew,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <SelectPlanType form={form} required />
            <Input
              key={form.key(formNames.planName)}
              name={formNames.planName}
              required
              {...form.getInputProps(formNames.planName)}
            />
            <Textarea
              key={form.key(formNames.planDescription)}
              maxLength={1000}
              name={formNames.planDescription}
              required
              {...form.getInputProps(formNames.planDescription)}
            />
            <Input
              key={form.key(formNames.planMaximumListingsInMonth)}
              name={formNames.planMaximumListingsInMonth}
              required
              type="number"
              {...form.getInputProps(formNames.planMaximumListingsInMonth)}
            />
            <Input
              key={form.key(formNames.planListingDurationMonths)}
              name={formNames.planListingDurationMonths}
              required
              type="number"
              {...form.getInputProps(formNames.planListingDurationMonths)}
            />
            {!isTrialPlan && (
              <>
                <Input
                  key={form.key(formNames.planPrice)}
                  name={formNames.planPrice}
                  required
                  type="number"
                  {...form.getInputProps(formNames.planPrice)}
                />
                <SelectPlanInterval form={form} required />
                <Input
                  key={form.key(formNames.planIntervalCount)}
                  name={formNames.planIntervalCount}
                  required
                  type="number"
                  {...form.getInputProps(formNames.planIntervalCount)}
                />
                <Checkbox
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

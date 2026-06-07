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
import type { T_PlatformSetting } from "~/models/platformSetting";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { Select } from "~/ui/Select";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const AdminPlatformSettingEditPage = ({
  plans,
  platformSetting,
}: {
  plans: T_Plans;
  platformSetting: T_PlatformSetting;
}) => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { t } = useTranslation(namespaces.adminSettingEdit);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const formDefaultValues = {
    [formNames.freeTrialCompanyMonthsCount]:
      platformSetting.freeTrialCompanyMonthsCount,
    [formNames.freeTrialMaxListings]: platformSetting.freeTrialMaxListings,
    [formNames.planId]: platformSetting.planFreeTrialCompany.id,
    [formNames.pointsBigBug]: platformSetting.pointsBigBug,
    [formNames.pointsMediumBug]: platformSetting.pointsMediumBug,
    [formNames.pointsReferralCompany]: platformSetting.pointsReferralCompany,
    [formNames.pointsReferralUser]: platformSetting.pointsReferralUser,
    [formNames.pointsSmallBug]: platformSetting.pointsSmallBug,
  };

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: formDefaultValues,
    mode: "uncontrolled",
    validate: {
      [formNames.freeTrialCompanyMonthsCount]: value =>
        checkFormValidator({
          formName: formNames.freeTrialCompanyMonthsCount,
          value,
        }),
      [formNames.freeTrialMaxListings]: value =>
        checkFormValidator({
          formName: formNames.freeTrialMaxListings,
          value,
        }),
      [formNames.planId]: value =>
        checkFormValidator({ formName: formNames.planId, value }),
      [formNames.pointsBigBug]: value =>
        checkFormValidator({
          formName: formNames.pointsBigBug,
          value,
        }),
      [formNames.pointsMediumBug]: value =>
        checkFormValidator({
          formName: formNames.pointsMediumBug,
          value,
        }),
      [formNames.pointsReferralCompany]: value =>
        checkFormValidator({
          formName: formNames.pointsReferralCompany,
          value,
        }),
      [formNames.pointsReferralUser]: value =>
        checkFormValidator({ formName: formNames.pointsReferralUser, value }),
      [formNames.pointsSmallBug]: value =>
        checkFormValidator({
          formName: formNames.pointsSmallBug,
          value,
        }),
    },
  });

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
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

      const {
        freeTrialCompanyMonthsCount,
        freeTrialMaxListings,
        planId,
        pointsBigBug,
        pointsMediumBug,
        pointsReferralCompany,
        pointsReferralUser,
        pointsSmallBug,
      } = formData;

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.freeTrialCompanyMonthsCount]: freeTrialCompanyMonthsCount,
          [formNames.freeTrialMaxListings]: freeTrialMaxListings,
          [formNames.planId]: planId,
          [formNames.pointsBigBug]: pointsBigBug,
          [formNames.pointsMediumBug]: pointsMediumBug,
          [formNames.pointsReferralCompany]: pointsReferralCompany,
          [formNames.pointsReferralUser]: pointsReferralUser,
          [formNames.pointsSmallBug]: pointsSmallBug,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.adminSettingEdit,
          }),
          method: "patch",
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
            E_Routes.adminSettings,
            E_Routes.adminSettingEdit,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.adminSettings} />
              <ButtonSave type="submit" />
            </>
          }
          pageMeta={{
            route: E_Routes.adminSettingEdit,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <Input
              key={form.key(formNames.pointsReferralUser)}
              {...form.getInputProps(formNames.pointsReferralUser)}
              disabledWithOpacity={false}
              name={formNames.pointsReferralUser}
              required
              type="number"
            />
            <Input
              key={form.key(formNames.pointsReferralCompany)}
              {...form.getInputProps(formNames.pointsReferralCompany)}
              disabledWithOpacity={false}
              name={formNames.pointsReferralCompany}
              required
              type="number"
            />
            <Input
              key={form.key(formNames.pointsSmallBug)}
              {...form.getInputProps(formNames.pointsSmallBug)}
              disabledWithOpacity={false}
              name={formNames.pointsSmallBug}
              required
              type="number"
            />
            <Input
              key={form.key(formNames.pointsMediumBug)}
              {...form.getInputProps(formNames.pointsMediumBug)}
              disabledWithOpacity={false}
              name={formNames.pointsMediumBug}
              required
              type="number"
            />
            <Input
              key={form.key(formNames.pointsBigBug)}
              {...form.getInputProps(formNames.pointsBigBug)}
              disabledWithOpacity={false}
              name={formNames.pointsBigBug}
              required
              type="number"
            />
            <Select
              key={form.key(formNames.planId)}
              name={formNames.planId}
              options={mapPlansToOptions}
              required
              {...form.getInputProps(formNames.planId)}
              label={t("planFreeTrialCompany")}
            />
            <Input
              key={form.key(formNames.freeTrialCompanyMonthsCount)}
              {...form.getInputProps(formNames.freeTrialCompanyMonthsCount)}
              disabledWithOpacity={false}
              name={formNames.freeTrialCompanyMonthsCount}
              required
              type="number"
            />
            <Input
              key={form.key(formNames.freeTrialMaxListings)}
              {...form.getInputProps(formNames.freeTrialMaxListings)}
              disabledWithOpacity={false}
              name={formNames.freeTrialMaxListings}
              required
              type="number"
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

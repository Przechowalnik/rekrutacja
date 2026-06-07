import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { type SyntheticEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useRecaptcha } from "~/hooks/useRecaptcha";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

export const RecoveryAccountPage = () => {
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [haveChanges, setHaveChanges] = useState(false);

  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { t } = useTranslation(namespaces.recoveryAccount);
  const { executeV3 } = useRecaptcha();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: { [formNames.email]: "" },
    mode: "uncontrolled",
    onValuesChange: values => {
      setHaveChanges(!!values[formNames.email]);
    },
    validate: {
      [formNames.email]: value => {
        return checkFormValidator({ formName: formNames.email, value });
      },
    },
  });

  const handleSubmit = async (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    setIsLoadingButton(true);

    if (!executeV3) {
      notifications.show({
        color: "red",
        message: "",
        title: tNotifications(`errorOnLoadRecaptcha.message`),
      });
      setIsLoadingButton(false);
      return;
    }

    const newRecaptchaToken = await executeV3("recovery_account");
    if (!newRecaptchaToken) {
      notifications.show({
        color: "red",
        message: "",
        title: tNotifications(`noCheckedRecaptcha.message`),
      });
      setIsLoadingButton(false);
      return;
    }
    setIsLoadingButton(false);

    submit(
      convertToFormData({
        ...values,
        [formNames.recaptcha]: newRecaptchaToken,
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.apiRecoveryAccount,
        }),
        method: "post",
      },
    );
  };

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  return (
    <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
      <Section
        breadcrumbs={[E_Routes.home, E_Routes.login, E_Routes.recoveryAccount]}
        buttons={
          <>
            <Button routeTo={E_Routes.login} variant="light">
              {t("buttonLogin")}
            </Button>
            <Button
              disabled={!haveChanges}
              loading={isLoadingButton}
              tooltip={{
                label: tCommon("buttonNoChangesTooltip"),
              }}
              type="submit"
            >
              {t("buttonRecoveryAccount")}
            </Button>
          </>
        }
        description={t("description")}
        pageMeta={{
          route: E_Routes.recoveryAccount,
        }}
        size="sm"
        title={t("title")}
      >
        <InputWrapper>
          <Input
            clearable
            form={form}
            key={form.key(formNames.email)}
            name={formNames.email}
            required
            type="email"
            {...form.getInputProps(formNames.email)}
          />
        </InputWrapper>
      </Section>
    </Form>
  );
};

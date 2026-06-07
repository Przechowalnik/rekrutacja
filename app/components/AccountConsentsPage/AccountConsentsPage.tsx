import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { type SyntheticEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { formNames } from "~/lib/zodFormValidator";
import type { T_UserConsent } from "~/models/userSession/userConsent";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Checkbox } from "~/ui/Checkbox";
import { Form } from "~/ui/Form";
import { InputWrapper } from "~/ui/InputWrapper";
import { Link } from "~/ui/Link";
import { Section } from "~/ui/Section";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

type T_AccountConsentsPage = {
  userConsent: T_UserConsent;
};

export const AccountConsentsPage = ({ userConsent }: T_AccountConsentsPage) => {
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [haveChanges, setHaveChanges] = useState(false);

  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t } = useTranslation(namespaces.accountConsents);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const initialValues = {
    [formNames.checkboxConsentNewsletter]: !!userConsent?.newsletterAt,
    [formNames.checkboxConsentOpinion]: !!userConsent?.opinionAt,
  };

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues,
    mode: "uncontrolled",
    onValuesChange(values) {
      if (!userConsent) {
        return;
      }

      const isObjectsTheSame = compareObjects({
        object1: initialValues,
        object2: values,
      });

      setHaveChanges(!isObjectsTheSame);
    },
    validate: {},
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
            route: E_Routes.accountConsents,
          }),
          method: "patch",
        },
      );
    },
    [form, submit],
  );

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

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
            E_Routes.account,
            E_Routes.accountConsents,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.account} />
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
            route: E_Routes.accountConsents,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <Checkbox
              key={form.key(formNames.checkboxConsentNewsletter)}
              name={formNames.checkboxConsentNewsletter}
              required={false}
              {...form.getInputProps(formNames.checkboxConsentNewsletter, {
                type: "checkbox",
              })}
              label={
                <>
                  {tCommon("inputs.checkboxConsentNewsletter")}{" "}
                  <Link
                    fw="bold"
                    onDisabledWithUnderline
                    rel="noreferrer"
                    target="_blank"
                    text
                    to={getLocalizedRoute({
                      route: E_Routes.newsletter,
                    })}
                    withUnderline
                  >
                    {tCommon(
                      "inputs.checkboxAcceptTermsAndRegulationsNewsletterLink",
                    )}
                  </Link>{" "}
                  {tCommon("inputs.checkboxAcceptRegulationsAnd")}{" "}
                  <Link
                    fw="bold"
                    onDisabledWithUnderline
                    rel="noreferrer"
                    target="_blank"
                    text
                    to={getLocalizedRoute({
                      route: E_Routes.privacyPolicy,
                    })}
                    withUnderline
                  >
                    {tCommon("inputs.checkboxAcceptPrivacyPolicySingleLink")}
                  </Link>
                </>
              }
            />
            <Checkbox
              key={form.key(formNames.checkboxConsentOpinion)}
              name={formNames.checkboxConsentOpinion}
              required={false}
              {...form.getInputProps(formNames.checkboxConsentOpinion, {
                type: "checkbox",
              })}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

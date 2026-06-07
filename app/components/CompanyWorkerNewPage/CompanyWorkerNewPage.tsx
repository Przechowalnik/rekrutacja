import { Box, Flex } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { queryKey } from "~/constants/queryAndHashes";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { E_Language } from "~/models/enums";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Checkbox } from "~/ui/Checkbox";
import { Fieldset } from "~/ui/Fieldset";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Link } from "~/ui/Link";
import { PasswordSafeVisualization } from "~/ui/PasswordSafeVisualization";
import { Section } from "~/ui/Section";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const CompanyWorkerNewPage = () => {
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { user } = useUser();
  const { t } = useTranslation(namespaces.companyWorkerNew);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tRegistration } = useTranslation(namespaces.registrationAccount);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.checkboxAcceptNewsletter]: false,
      // [formNames.phoneNumber]: "",
      // [formNames.phoneCountryCode]: E_CountryCode.POLAND,
      [formNames.checkboxAcceptRegulations]: false,
      [formNames.email]: "",
      [formNames.language]: E_Language.PL,
      [formNames.userFirstName]: "",
      [formNames.userLastName]: "",
    },
    mode: "uncontrolled",
    validate: {
      [formNames.checkboxAcceptNewsletter]: value =>
        checkFormValidator({
          formName: formNames.checkboxAcceptNewsletter,
          optional: true,
          value,
        }),
      [formNames.checkboxAcceptRegulations]: value =>
        checkFormValidator({
          formName: formNames.checkboxAcceptRegulations,
          value,
        }),
      [formNames.email]: value =>
        checkFormValidator({ formName: formNames.email, value }),
      // [formNames.phoneNumber]: value =>
      //   checkFormValidator({
      //     formName: formNames.phoneNumber,
      //     value,
      //   }),
      // [formNames.phoneCountryCode]: value =>
      //   checkFormValidator({
      //     formName: formNames.phoneCountryCode,
      //     value,
      //   }),
      [formNames.language]: value =>
        checkFormValidator({
          formName: formNames.language,
          value,
        }),
      [formNames.userFirstName]: value =>
        checkFormValidator({ formName: formNames.userFirstName, value }),
      [formNames.userLastName]: value =>
        checkFormValidator({
          formName: formNames.userLastName,
          optional: true,
          value,
        }),
    },
  });

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleChangeInput = useCallback(
    (value: number | string, setState: Dispatch<SetStateAction<string>>) => {
      setState(value.toString());
    },
    [],
  );

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleSubmit = async (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    if (!values[formNames.checkboxAcceptRegulations]) {
      notifications.show({
        color: "red",
        message: "",
        title: tNotifications(`noCheckedCheckboxRegulations.title`),
      });
      return;
    }

    const passwordErrorMessage = checkFormValidator({
      formName: formNames.password,
      value: password,
    });

    if (passwordErrorMessage) {
      notifications.show({
        color: "red",
        message: "",
        title: tCommon(`formValidator.${passwordErrorMessage}`),
      });
      return;
    }

    const passwordRepeatErrorMessage = checkFormValidator({
      formName: formNames.password,
      value: passwordRepeat,
    });

    if (passwordRepeatErrorMessage) {
      notifications.show({
        color: "red",
        message: "",
        title: tCommon(`formValidator.${passwordRepeatErrorMessage}`),
      });
      return;
    }

    // const { phoneCountryCode, phoneNumber } = values;

    // if (!phoneNumber || !phoneCountryCode) {
    //   notifications.show({
    //     color: "red",
    //     message: tNotifications(`somethingWentWrong.message`),
    //     title: tNotifications(`somethingWentWrong.title`),
    //   });
    //   return;
    // }

    setAuthenticatorOpen(true);
  };

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorOpen(false);

      const formData = form.getValues();

      if (!formData) {
        return;
      }

      if (!formData[formNames.checkboxAcceptRegulations]) {
        notifications.show({
          color: "red",
          message: "",
          title: tNotifications(`noCheckedCheckboxRegulations.title`),
        });
        return;
      }

      const passwordErrorMessage = checkFormValidator({
        formName: formNames.password,
        value: password,
      });

      if (passwordErrorMessage) {
        notifications.show({
          color: "red",
          message: "",
          title: tCommon(`formValidator.${passwordErrorMessage}`),
        });
        return;
      }

      const passwordRepeatErrorMessage = checkFormValidator({
        formName: formNames.password,
        value: passwordRepeat,
      });

      if (passwordRepeatErrorMessage) {
        notifications.show({
          color: "red",
          message: "",
          title: tCommon(`formValidator.${passwordRepeatErrorMessage}`),
        });
        return;
      }

      const {
        checkboxAcceptNewsletter,
        checkboxAcceptRegulations,
        email,
        // phoneCountryCode,
        // phoneNumber,
        language,
        userFirstName,
        userLastName,
      } = formData;

      // if (!phoneNumber || !phoneCountryCode) {
      //   notifications.show({
      //     color: "red",
      //     message: tNotifications(`somethingWentWrong.message`),
      //     title: tNotifications(`somethingWentWrong.title`),
      //   });
      //   return;
      // }

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.checkboxAcceptNewsletter]: checkboxAcceptNewsletter,
          [formNames.checkboxAcceptRegulations]: checkboxAcceptRegulations,
          [formNames.email]: email,
          [formNames.language]: language,
          [formNames.password]: password,
          [formNames.passwordRepeat]: passwordRepeat,
          [formNames.userFirstName]: userFirstName,
          [formNames.userLastName]: userLastName,
          // [formNames.phoneNumber]: phoneNumber,
          // [formNames.phoneCountryCode]: phoneCountryCode,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.companyWorkerNew,
          }),
          method: "post",
        },
      );
    },
    [form],
  );

  const handleCopyLinkToRegistration = useCallback(async () => {
    if (!user?.company?.id) {
      return;
    }

    const link = `${globalThis.location.origin}${getLocalizedRoute({
      extraQuery: {
        [queryKey.companyId]: user?.company?.id,
      },
      route: E_Routes.registrationAccount,
    })}`;

    try {
      await globalThis.navigator.clipboard.writeText(link);
      notifications.show({
        color: "green",
        message: tNotifications(`successCopyCode.message`),
        title: tNotifications(`successCopyCode.title`),
      });
      return;
    } catch {
      notifications.show({
        color: "red",
        message: tNotifications(`somethingWentWrong.message`),
        title: tNotifications(`somethingWentWrong.title`),
      });
      return;
    }
  }, [user]);

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
            E_Routes.companyWorkers,
            E_Routes.companyWorkerNew,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.companyWorkers} />
              <Button type="submit">{t("buttonNew")}</Button>
            </>
          }
          description={t("description")}
          pageMeta={{
            route: E_Routes.companyWorkerNew,
          }}
          size="md"
          title={t("title")}
        >
          <Button fullWidth mb={48} onClick={handleCopyLinkToRegistration}>
            {t("buttonLinkToRegistration")}
          </Button>
          <InputWrapper>
            <Fieldset legend={tRegistration("companyFields")} mt={12}>
              <Input
                clearable
                form={form}
                key={form.key(formNames.email)}
                name={formNames.email}
                required
                type="email"
                {...form.getInputProps(formNames.email)}
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
                  <Input
                    clearable
                    form={form}
                    key={form.key(formNames.userFirstName)}
                    name={formNames.userFirstName}
                    required
                    type="text"
                    {...form.getInputProps(formNames.userFirstName)}
                  />
                </Box>
                <Box
                  w={{
                    base: "100%",
                    xs: "calc(50% - 12px)",
                  }}
                >
                  <Input
                    clearable
                    form={form}
                    key={form.key(formNames.userLastName)}
                    name={formNames.userLastName}
                    required={false}
                    type="text"
                    {...form.getInputProps(formNames.userLastName)}
                  />
                </Box>
              </Flex>
              {/* <InputPhone required form={form} /> */}
              <Input
                key={form.key(formNames.password)}
                name={formNames.password}
                required
                type="password"
                {...form.getInputProps(formNames.password)}
                clearable
                onChange={value => handleChangeInput(value, setPassword)}
              />
              <Input
                key={form.key(formNames.passwordRepeat)}
                name={formNames.passwordRepeat}
                required
                type="password"
                {...form.getInputProps(formNames.passwordRepeat)}
                clearable
                onChange={value => handleChangeInput(value, setPasswordRepeat)}
              />
            </Fieldset>
            <PasswordSafeVisualization
              password={password}
              passwordRepeat={passwordRepeat}
            />
            <div>
              <Checkbox
                key={form.key(formNames.checkboxAcceptRegulations)}
                label={
                  <>
                    {tCommon("inputs.checkboxAcceptRegulationsText")}{" "}
                    <Link
                      fw="bold"
                      onDisabledWithUnderline
                      rel="noreferrer"
                      target="_blank"
                      text
                      to={getLocalizedRoute({
                        route: E_Routes.termsAndConditions,
                      })}
                      withUnderline
                    >
                      {tCommon("inputs.checkboxAcceptTermsAndRegulationsLink")}
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
                      {tCommon("inputs.checkboxAcceptPrivacyPolicyLink")}
                    </Link>
                  </>
                }
                mb={24}
                mt={12}
                name={formNames.checkboxAcceptRegulations}
                required={false}
                w="100%"
                withAsterisk
                {...form.getInputProps(formNames.checkboxAcceptRegulations, {
                  type: "checkbox",
                })}
              />
              <Checkbox
                key={form.key(formNames.checkboxAcceptNewsletter)}
                label={
                  <>
                    {tCommon("inputs.checkboxAcceptNewsletter")}{" "}
                    <Link
                      fw="bold"
                      onDisabledWithUnderline
                      rel="noreferrer"
                      target="_blank"
                      text
                      to={getLocalizedRoute({
                        route: E_Routes.termsAndConditions,
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
                      {tCommon("inputs.checkboxAcceptPrivacyPolicyLink")}
                    </Link>
                  </>
                }
                mb={24}
                mt={12}
                name={formNames.checkboxAcceptNewsletter}
                required={false}
                w="100%"
                {...form.getInputProps(formNames.checkboxAcceptNewsletter, {
                  type: "checkbox",
                })}
              />
            </div>
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

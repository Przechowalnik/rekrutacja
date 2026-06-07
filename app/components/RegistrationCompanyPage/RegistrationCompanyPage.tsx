import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { Alert, Box, Flex } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { queryKey } from "~/constants/queryAndHashes";
import { E_Routes } from "~/constants/routes";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useRecaptcha } from "~/hooks/useRecaptcha";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { E_CountryCode, E_TaxCountry } from "~/models/enums";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Checkbox } from "~/ui/Checkbox";
import { Collapse } from "~/ui/Collapse";
import { Fieldset } from "~/ui/Fieldset";
import { Form } from "~/ui/Form";
import { IconSeo } from "~/ui/IconSeo";
import { Input } from "~/ui/Input";
import { InputPhone } from "~/ui/InputPhone";
import { InputTax } from "~/ui/InputTax";
import { InputWrapper } from "~/ui/InputWrapper";
import { Link } from "~/ui/Link";
import { PasswordSafeVisualization } from "~/ui/PasswordSafeVisualization";
import { Section } from "~/ui/Section";
import { SegmentControl } from "~/ui/SegmentControl";
import { Text } from "~/ui/Text";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

export const RegistrationCompanyPage = () => {
  const [addedReferralCode, setAddedReferralCode] = useState<null | string>(
    null,
  );
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const { platformColor } = useLayout();
  const { executeV3 } = useRecaptcha();
  const navigate = useNavigate();
  const [searchParameters] = useSearchParams();
  const fetcher = useFetcherWithActions({});
  const { t: tCommon } = useTranslation(namespaces.common);
  const { i18n, t } = useTranslation(namespaces.registrationCompany);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.checkboxAcceptNewsletter]: false,
      [formNames.checkboxAcceptRegulations]: false,
      [formNames.companyName]: "",
      [formNames.companyPhoneCountryCode]: E_CountryCode.POLAND,
      [formNames.companyPhoneNumber]: "",
      [formNames.email]: "",
      [formNames.language]: i18n.language.toUpperCase(),
      [formNames.phoneCountryCode]: E_CountryCode.POLAND,
      [formNames.phoneNumber]: "",
      [formNames.referralCode]:
        searchParameters.get(queryKey.referralCode) ?? "",
      [formNames.taxCountry]: E_TaxCountry.POLAND,
      [formNames.taxNumber]: "",
      [formNames.userFirstName]: "",
      [formNames.userLastName]: "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      const { referralCode } = values;

      setAddedReferralCode(referralCode ?? null);
    },
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
      [formNames.companyName]: value =>
        checkFormValidator({
          formName: formNames.companyName,
          value,
        }),
      [formNames.companyPhoneCountryCode]: value =>
        checkFormValidator({
          formName: formNames.companyPhoneCountryCode,
          value,
        }),
      [formNames.companyPhoneNumber]: value =>
        checkFormValidator({
          formName: formNames.companyPhoneNumber,
          value,
        }),
      [formNames.email]: value =>
        checkFormValidator({ formName: formNames.email, value }),
      [formNames.language]: value =>
        checkFormValidator({
          formName: formNames.language,
          value,
        }),
      [formNames.phoneCountryCode]: value =>
        checkFormValidator({
          formName: formNames.phoneCountryCode,
          optional: true,
          value,
        }),
      [formNames.phoneNumber]: value =>
        checkFormValidator({
          formName: formNames.phoneNumber,
          optional: true,
          value,
        }),
      [formNames.referralCode]: value =>
        checkFormValidator({
          formName: formNames.referralCode,
          optional: true,
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
      //user
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

  useEffect(() => {
    const newReferralCode = searchParameters.get(queryKey.referralCode);
    setAddedReferralCode(newReferralCode ?? null);
  }, []);

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

    const newRecaptchaToken = await executeV3("registration");
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

    const {
      checkboxAcceptNewsletter,
      checkboxAcceptRegulations,
      companyName,
      companyPhoneCountryCode,
      companyPhoneNumber,
      email,
      phoneCountryCode,
      phoneNumber,
      referralCode,
      taxCountry,
      taxNumber,
      userFirstName,
      userLastName,
    } = values;

    if (!checkboxAcceptRegulations) {
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

    let validPhoneNumber: string | undefined;
    let validPhoneCountryCode: string | undefined;
    if (phoneNumber) {
      if (!phoneCountryCode) {
        notifications.show({
          color: "red",
          message: tNotifications(`somethingWentWrong.message`),
          title: tNotifications(`somethingWentWrong.title`),
        });
        return;
      }

      validPhoneNumber = phoneNumber;
      validPhoneCountryCode = phoneCountryCode;
    }

    fetcher.submit(
      convertToFormData({
        [formNames.checkboxAcceptNewsletter]: checkboxAcceptNewsletter,
        [formNames.checkboxAcceptRegulations]: checkboxAcceptRegulations,
        [formNames.companyName]: companyName,
        [formNames.companyPhoneCountryCode]: companyPhoneCountryCode,
        [formNames.companyPhoneNumber]: companyPhoneNumber,
        [formNames.email]: email,
        [formNames.language]: i18n.language.toUpperCase(),
        [formNames.password]: password,
        [formNames.passwordRepeat]: passwordRepeat,
        [formNames.recaptcha]: newRecaptchaToken,
        [formNames.referralCode]: referralCode,
        [formNames.taxCountry]: taxCountry,
        [formNames.taxNumber]: taxNumber,
        [formNames.userFirstName]: userFirstName,
        [formNames.userLastName]: userLastName,
        ...(validPhoneNumber && validPhoneCountryCode
          ? {
              [formNames.phoneCountryCode]: validPhoneCountryCode,
              [formNames.phoneNumber]: validPhoneNumber,
            }
          : {}),
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.apiRegistrationCompany,
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

  const handleChangeInput = useCallback(
    (value: number | string, setState: Dispatch<SetStateAction<string>>) => {
      setState(value.toString());
    },
    [],
  );

  const handleUpdateSegmentControl = useCallback((value: string) => {
    navigate(
      getLocalizedRoute({
        route: value as E_Routes,
      }),
    );
  }, []);

  return (
    <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
      <Section
        breadcrumbs={[
          E_Routes.home,
          E_Routes.registration,
          E_Routes.registrationCompany,
        ]}
        buttons={
          <>
            <ButtonArrowLeft routeTo={E_Routes.registration} textGoBack />
            <Button routeTo={E_Routes.login} variant="light">
              {t("buttonGoToLogin")}
            </Button>
            <Button routeTo={E_Routes.registrationAccount} variant="light">
              {t("buttonRegistrationUser")}
            </Button>
            <Button loading={isLoadingButton} type="submit">
              {t("buttonRegistration")}
            </Button>
          </>
        }
        description={t("description")}
        pageMeta={{
          route: E_Routes.registrationCompany,
        }}
        size="md"
        sizeButtons="md"
        title={t("title")}
      >
        <InputWrapper>
          <SegmentControl
            data={[
              {
                label: tCommon(`breadcrumbs.${E_Routes.registrationAccount}`),
                value: E_Routes.registrationAccount,
              },
              {
                label: tCommon(`breadcrumbs.${E_Routes.registrationCompany}`),
                value: E_Routes.registrationCompany,
              },
            ]}
            defaultValue={E_Routes.registrationCompany}
            maw={{
              base: 300,
              xs: 600,
            }}
            onChange={handleUpdateSegmentControl}
            value={E_Routes.registrationCompany}
            w="100%"
          />
          <Fieldset legend={t("companyFields")} withRequired>
            <Input
              clearable
              form={form}
              key={form.key(formNames.companyName)}
              name={formNames.companyName}
              required
              type="text"
              {...form.getInputProps(formNames.companyName)}
            />
            <InputTax form={form} required />
            <InputPhone form={form} isCompanyPhone required />
          </Fieldset>
          <Fieldset legend={t("userFields")} mt={12} withRequired>
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
                  maxLength={30}
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
                  maxLength={30}
                />
              </Box>
            </Flex>
            {/* <InputPhone form={form} required={false} /> */}
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
          <Fieldset legend={t("checkboxFieldset")} withRequired>
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
                    {tCommon("inputs.checkboxAcceptPrivacyPolicyLink")}
                  </Link>
                </>
              }
              name={formNames.checkboxAcceptNewsletter}
              required={false}
              w="100%"
              {...form.getInputProps(formNames.checkboxAcceptNewsletter, {
                type: "checkbox",
              })}
            />
          </Fieldset>
          <Input
            clearable
            form={form}
            key={form.key(formNames.referralCode)}
            name={formNames.referralCode}
            required={false}
            type="text"
            {...form.getInputProps(formNames.referralCode)}
          />
          <Collapse fullWith opened={!!addedReferralCode}>
            <Alert
              color={platformColor}
              icon={<IconSeo icon={faCircleInfo} size="xl" />}
            >
              <Text c={platformColor} fw="bold" size="md">
                {t("informationReferral")}
              </Text>
            </Alert>
          </Collapse>
        </InputWrapper>
      </Section>
    </Form>
  );
};

import { Box } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { SyntheticEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { queryKey, queryValue } from "~/constants/queryAndHashes";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useRecaptcha } from "~/hooks/useRecaptcha";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Z_Login } from "~/models/login";
import { Button } from "~/ui/Button";
import { ButtonWrapper } from "~/ui/ButtonWrapper";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const LoginPage = () => {
  const [showAlertLoginListing, setShowAlertLoginListing] = useState(false);
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [isLoadingButton, setIsLoadingButton] = useState(false);

  const { executeV3 } = useRecaptcha();
  const fetcher = useFetcherWithActions({
    schema: Z_Login.optional(),
  });
  const [searchParameters, setSearchParameters] = useSearchParams();
  const fetcher2Fa = useFetcherWithActions({});
  const { t: tLogin } = useTranslation(namespaces.login);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: { [formNames.email]: "", [formNames.password]: "" },
    mode: "uncontrolled",
    validate: {
      [formNames.email]: value => {
        return checkFormValidator({ formName: formNames.email, value });
      },
      [formNames.password]: value =>
        checkFormValidator({ formName: formNames.password, value }),
    },
  });

  useEffect(() => {
    if (!fetcher?.data?.userId) {
      return;
    }

    setAuthenticatorOpen(true);
  }, [fetcher.data]);

  useEffect(() => {
    const newSearchParameters = new URLSearchParams(searchParameters);
    const alertValue = newSearchParameters.get(queryKey.alert);

    if (alertValue) {
      setShowAlertLoginListing(alertValue === queryValue.showLoginListing);

      newSearchParameters.delete(queryKey.alert);
      setSearchParameters(newSearchParameters);
    }
  }, [searchParameters]);

  const handleSubmit = async (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    setIsLoadingButton(true);
    try {
      if (!executeV3) {
        notifications.show({
          color: "red",
          message: "",
          title: tNotifications(`errorOnLoadRecaptcha.message`),
        });
        setIsLoadingButton(false);
        return;
      }

      const newRecaptchaToken = await executeV3("login");
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

      fetcher.submit(
        convertToFormData({
          ...values,
          [formNames.recaptcha]: newRecaptchaToken,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.apiLogin,
          }),
          method: "post",
        },
      );
    } catch {
      notifications.show({
        color: "red",
        message: "",
        title: tNotifications(`noCheckedRecaptcha.message`),
      });
      setIsLoadingButton(false);
      return;
    }
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
    (authenticator: number | string) => {
      const formData = form.getValues();

      if (!formData) {
        return;
      }

      setAuthenticatorOpen(false);
      fetcher2Fa.submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.email]: formData?.email,
          [formNames.password]: formData?.password,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.apiLogin,
          }),
          method: "put",
        },
      );
    },
    [form],
  );

  const noLoggedUserData = useMemo(() => {
    if (!fetcher.data?.userId) {
      return;
    }

    return {
      authenticator2FAEnabled: !!fetcher?.data?.authenticator2FAEnabled,
      authenticatorEmailOTPEnabled:
        !!fetcher?.data?.authenticatorEmailOTPEnabled,
      authenticatorPassword: false,
      userId: fetcher?.data?.userId,
    };
  }, [fetcher.data]);

  return (
    <>
      <ModalAuthenticator
        noLoggedUser={noLoggedUserData}
        onClose={handleCloseAuthenticator}
        onSuccess={handleAuthenticatorOnSuccess}
        opened={authenticatorOpen}
      />
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          breadcrumbs={[E_Routes.home, E_Routes.login]}
          buttons={
            <>
              <Button
                hiddenFrom="xs"
                routeTo={E_Routes.recoveryAccount}
                variant="light"
              >
                {tLogin("buttonRecovery")}
              </Button>
              <Button
                hiddenFrom="xs"
                routeTo={E_Routes.registration}
                variant="light"
              >
                {tLogin("buttonGoToRegistration")}
              </Button>
            </>
          }
          description={tLogin("description")}
          pageMeta={{
            route: E_Routes.login,
          }}
          size="sm"
          sizeButtons="sm"
          title={tLogin("title")}
          warning={showAlertLoginListing ? tLogin("warningListing") : undefined}
        >
          <InputWrapper>
            <Input
              autoComplete="email"
              clearable
              form={form}
              key={form.key(formNames.email)}
              name={formNames.email}
              required
              type="email"
              {...form.getInputProps(formNames.email)}
            />
            <Input
              autoComplete="current-password"
              key={form.key(formNames.password)}
              name={formNames.password}
              required
              type="password"
              {...form.getInputProps(formNames.password)}
              clearable
            />
          </InputWrapper>
          <Box pb={16} pt={24} w="100%">
            <ButtonWrapper p={0}>
              <Button
                routeTo={E_Routes.recoveryAccount}
                variant="light"
                visibleFrom="xs"
              >
                {tLogin("buttonRecovery")}
              </Button>
              <Button
                routeTo={E_Routes.registration}
                variant="light"
                visibleFrom="xs"
              >
                {tLogin("buttonGoToRegistration")}
              </Button>
              <Button loading={isLoadingButton} type="submit">
                {tLogin("buttonLogin")}
              </Button>
            </ButtonWrapper>
          </Box>
        </Section>
      </Form>
    </>
  );
};

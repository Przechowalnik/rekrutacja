import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useActionData,
  useFetchers,
  useNavigate,
  useSearchParams,
} from "react-router";

import { namespaces } from "~/constants/namespaces";
import { queryKey } from "~/constants/queryAndHashes";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useRecaptcha } from "~/hooks/useRecaptcha";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { PasswordSafeVisualization } from "~/ui/PasswordSafeVisualization";
import { Section } from "~/ui/Section";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

type T_ActionData =
  | {
      authenticator2FAEnabled?: boolean;
      authenticatorEmailOTPEnabled?: boolean;
      message?: string;
      userId: string;
    }
  | {
      message?: string;
    };

export const RecoveryAccountChangePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [queryParameters, setQueryParameters] = useState<{
    queryCode: string;
    queryUserId: string;
  } | null>(null);
  const [formData, setFormData] = useState<{
    password: string;
    passwordRepeat: string;
  } | null>(null);
  const [isLoadingButton, setIsLoadingButton] = useState(false);

  const { executeV3 } = useRecaptcha();
  const submit = useSubmitWithActions();
  const [searchParameters, setSearchParameters] = useSearchParams();
  const navigate = useNavigate();
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t } = useTranslation(namespaces.recoveryAccountChangePassword);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const actionData = useActionData<T_ActionData>();
  const fetchers = useFetchers();
  const { getLocalizedRoute } = useLocalizedRoute();

  const isLoadingFetchers = fetchers.some(item => item.state !== "idle");

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {},
    mode: "uncontrolled",
    validate: {},
  });

  useEffect(() => {
    if (
      actionData &&
      ("authenticator2FAEnabled" in actionData ||
        "authenticatorEmailOTPEnabled" in actionData)
    ) {
      setAuthenticatorOpen(true);
    }
  }, [actionData]);

  useEffect(() => {
    setFormData(null);
  }, []);

  useEffect(() => {
    const queryUserId = searchParameters.get(queryKey.userId);
    const queryCode = searchParameters.get(queryKey.code);

    if (!queryUserId || !queryCode) {
      return;
    }

    setQueryParameters({
      queryCode,
      queryUserId,
    });

    const newSearchParameters = new URLSearchParams(
      searchParameters.toString(),
    );
    newSearchParameters.delete(queryKey.userId);
    newSearchParameters.delete(queryKey.code);
    setSearchParameters(newSearchParameters);
  }, [searchParameters]);

  useEffect(() => {
    const queryUserId = searchParameters.get(queryKey.userId);
    const queryCode = searchParameters.get(queryKey.code);

    if (!queryParameters && !queryUserId && !queryCode) {
      navigate(
        getLocalizedRoute({
          route: E_Routes.login,
        }),
      );
    }
  }, [searchParameters, queryParameters]);

  useEffect(() => {
    if (actionData?.message !== "recoveryAccountSuccess" || isLoadingFetchers) {
      return;
    }

    navigate(
      getLocalizedRoute({
        route: E_Routes.login,
      }),
    );
  }, [actionData, searchParameters, isLoadingFetchers]);

  const handleSubmit = async (
    _values: typeof form.values,
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

    if (!queryParameters) {
      notifications.show({
        color: "red",
        message: tNotifications(`recoveryLinkFail.message`),
        title: tNotifications(`recoveryLinkFail.title`),
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

    setFormData({
      password: password,
      passwordRepeat: passwordRepeat,
    });

    submit(
      convertToFormData({
        [formNames.code]: queryParameters.queryCode,
        [formNames.password]: password,
        [formNames.passwordRepeat]: passwordRepeat,
        [formNames.recaptcha]: newRecaptchaToken,
        [formNames.userId]: queryParameters.queryUserId,
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.apiRecoveryAccountChangePassword,
        }),
        method: "post",
      },
    );
  };

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

  const handleChangeInput = useCallback(
    (value: number | string, setState: Dispatch<SetStateAction<string>>) => {
      setState(value.toString());
    },
    [],
  );

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      if (!formData) {
        return;
      }

      setAuthenticatorOpen(false);

      if (!queryParameters) {
        notifications.show({
          color: "red",
          message: tNotifications(`recoveryLinkFail.message`),
          title: tNotifications(`recoveryLinkFail.title`),
        });
        return;
      }

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.code]: queryParameters.queryCode,
          [formNames.password]: formData.password,
          [formNames.passwordRepeat]: formData.passwordRepeat,
          [formNames.userId]: queryParameters.queryUserId,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.apiRecoveryAccountChangePassword,
          }),
          method: "post",
        },
      );
    },
    [form, formData, queryParameters],
  );

  return (
    <>
      <ModalAuthenticator
        noLoggedUser={
          actionData &&
          ("authenticator2FAEnabled" in actionData ||
            "authenticatorEmailOTPEnabled" in actionData)
            ? {
                authenticator2FAEnabled: !!actionData?.authenticator2FAEnabled,
                authenticatorEmailOTPEnabled:
                  !!actionData?.authenticatorEmailOTPEnabled,
                authenticatorPassword: false,
                userId: actionData?.userId,
              }
            : undefined
        }
        onClose={handleCloseAuthenticator}
        onSuccess={handleAuthenticatorOnSuccess}
        opened={authenticatorOpen}
      />
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          breadcrumbs={[
            E_Routes.home,
            E_Routes.login,
            E_Routes.recoveryAccount,
            E_Routes.recoveryAccountChangePassword,
          ]}
          buttons={
            <>
              <Button routeTo={E_Routes.recoveryAccount} variant="light">
                {t("buttonRecoveryAccount")}
              </Button>
              <Button loading={isLoadingButton} type="submit">
                {t("buttonChangePassword")}
              </Button>
            </>
          }
          description={t("description")}
          pageMeta={{
            route: E_Routes.recoveryAccountChangePassword,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
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
            <PasswordSafeVisualization
              password={password}
              passwordRepeat={passwordRepeat}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

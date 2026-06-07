import { Flex } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { type SyntheticEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { queryKey } from "~/constants/queryAndHashes";
import { E_Routes } from "~/constants/routes";
import { useCookies } from "~/hooks/useCookies";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Z_CodeString } from "~/models/code";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Collapse } from "~/ui/Collapse";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputCode } from "~/ui/InputCode";
import { Modal } from "~/ui/Modal";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { showAllErrorsForm } from "~/utilities/form";

import type { T_ModalAuthenticatorNoLoggedUser } from "../ModalAuthenticator";

type T_ModalAuthenticatorForm = {
  alert?: string;
  enabled2FA: boolean;
  enabledEmailOTP: boolean;
  enabledPassword: boolean;
  handleToggleReset2FA: () => void;
  noLoggedUser?: T_ModalAuthenticatorNoLoggedUser;
  onClose: () => void;
  onSuccess: (authenticator: number | string) => void;
  opened: boolean;
};

export const ModalAuthenticatorForm = ({
  alert,
  enabled2FA,
  enabledEmailOTP,
  enabledPassword,
  handleToggleReset2FA,
  noLoggedUser,
  onClose,
  onSuccess,
  opened,
}: T_ModalAuthenticatorForm) => {
  const [sendedAgainEmailOTPCode, setSendedAgainEmailOTPCode] = useState(false);

  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { getLocalizedRoute } = useLocalizedRoute();
  const { platformColor } = useLayout();
  const { t } = useTranslation(namespaces.common);
  const { isOtpCodeDisabled } = useCookies();
  const fetcher = useFetcherWithActions({
    schema: z.object({
      code: Z_CodeString.nullable().optional(),
    }),
  });

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.authenticator]: "",
    },
    mode: "uncontrolled",
    validate: {
      [formNames.authenticator]: value =>
        checkFormValidator({ formName: formNames.authenticator, value }),
    },
  });

  useEffect(() => {
    if (!opened || !enabledEmailOTP) {
      return;
    }

    fetcher.load(
      getLocalizedRoute({
        extraQuery: noLoggedUser
          ? {
              [queryKey.userId]: noLoggedUser.userId,
            }
          : {},
        route: E_Routes.authenticator,
      }),
    );
  }, [
    opened,
    enabledEmailOTP,
    noLoggedUser?.userId,
    sendedAgainEmailOTPCode,
    getLocalizedRoute,
  ]);

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    if (enabled2FA || enabledEmailOTP) {
      onSuccess?.(Number(values[formNames.authenticator]));
    } else {
      onSuccess?.(values[formNames.authenticator]);
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

  const handleSendAgainEmailOTPCode = useCallback(() => {
    setSendedAgainEmailOTPCode(true);
  }, []);

  const sectionDescription = (() => {
    if (enabledEmailOTP) {
      return t("modalAuthenticator.descriptionEmailOTP");
    }
    if (enabled2FA) {
      return t("modalAuthenticator.description2FA");
    }
    return t("modalAuthenticator.descriptionPassword");
  })();

  return (
    <Modal opened={opened} size="lg" zIndex={2020}>
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          alert={alert}
          buttons={
            <>
              {enabled2FA && (
                <Button
                  onClick={handleToggleReset2FA}
                  size="sm"
                  variant="light"
                >
                  {t("modalAuthenticator.buttonReset2FA")}
                </Button>
              )}
              <ButtonArrowLeft onClick={onClose} size="sm" />
              {enabledEmailOTP && (
                <Button
                  disabled={sendedAgainEmailOTPCode}
                  onClick={handleSendAgainEmailOTPCode}
                  size="sm"
                  variant="light"
                >
                  {t("modalAuthenticator.buttonSendAgainEmailOTPCode")}
                </Button>
              )}
              <Button size="sm" type="submit">
                {t("modalAuthenticator.buttonSubmit")}
              </Button>
            </>
          }
          description={sectionDescription}
          isInModal
          title={t("modalAuthenticator.title")}
          withHTML
        >
          <Collapse opened={isOtpCodeDisabled && !!fetcher.data?.code}>
            {isOtpCodeDisabled && fetcher.data?.code && (
              <Flex align="center" justify="center">
                <Text c={platformColor} fw="bold" pb={24} size="sm">
                  {fetcher.data.code}
                </Text>
              </Flex>
            )}
          </Collapse>
          {(enabledEmailOTP || enabled2FA) && (
            <InputCode
              key={form.key(formNames.authenticator)}
              name={formNames.authenticator}
              {...form.getInputProps(formNames.authenticator)}
            />
          )}
          {enabledPassword && (
            <Input
              autoComplete="current-password"
              description=""
              key={form.key(formNames.authenticator)}
              name={formNames.authenticatorPassword}
              required
              type="password"
              {...form.getInputProps(formNames.authenticator)}
            />
          )}
        </Section>
      </Form>
    </Modal>
  );
};

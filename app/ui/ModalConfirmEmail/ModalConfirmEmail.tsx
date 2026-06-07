import { Flex } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import type { PropsWithChildren, SyntheticEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useCookies } from "~/hooks/useCookies";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUserCookie } from "~/hooks/useUserCookie";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Z_CodeString } from "~/models/code";
import { E_Roles } from "~/models/enums";
import { Form } from "~/ui/Form";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { trackCompleteRegistration } from "~/utilities/tracking";

import { Button } from "../Button";
import { ButtonArrowLeft } from "../ButtonArrowLeft";
import { Collapse } from "../Collapse";
import { InputCode } from "../InputCode";
import { Modal } from "../Modal";
import { Section } from "../Section";
import { Text } from "../Text";
import { WrapperRemoveOnHidden } from "../WrapperRemoveOnHidden";

type T_ModalConfirmEmail = {
  emailOTPCode?: string;
  onClose?: () => void;
  onSuccess: () => void;
  opened: boolean;
};

export const ModalConfirmEmail = ({
  emailOTPCode,
  onClose,
  onSuccess,
  opened,
}: T_ModalConfirmEmail) => {
  const [sendedAgainEmailOTPCode, setSendedAgainEmailOTPCode] = useState(false);

  const { t } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { isOtpCodeDisabled } = useCookies();
  const { getLocalizedRoute } = useLocalizedRoute();
  const { platformColor } = useLayout();
  const { userCookie } = useUserCookie();
  const fetcher = useFetcherWithActions({
    schema: z.object({
      code: Z_CodeString.nullable().optional(),
      recoveryLink: z.string().nullable().optional(),
    }),
  });

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.code]: "",
    },
    mode: "uncontrolled",
    validate: {
      [formNames.code]: value =>
        checkFormValidator({ formName: formNames.code, value }),
    },
  });

  const validOTPCode = fetcher.data?.code ?? emailOTPCode;

  useEffect(() => {
    if (fetcher.data?.message !== "successConfirmEmail") {
      return;
    }

    trackCompleteRegistration({
      registrationType: userCookie?.userCompanyId
        ? userCookie?.userRole === E_Roles.B2B_OWNER
          ? "company"
          : "companyWorker"
        : "user",
    });

    if (onSuccess) {
      onSuccess();
    }
  }, [fetcher.data]);

  const handleSendAgainEmailOTPCode = useCallback(() => {
    setSendedAgainEmailOTPCode(true);
    fetcher.submit(null, {
      action: getLocalizedRoute({
        route: E_Routes.accountEmail,
      }),
      method: "post",
    });
  }, [fetcher, getLocalizedRoute]);

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    if (!values[formNames.code]) {
      return;
    }

    fetcher.submit(
      convertToFormData({
        [formNames.code]: values[formNames.code],
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.accountEmail,
        }),
        method: "put",
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
    <Modal opened={opened} size="lg" zIndex={2020}>
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          buttons={
            <>
              {onClose && (
                <ButtonArrowLeft onClick={onClose} size="sm" textClose />
              )}
              <Button
                disabled={sendedAgainEmailOTPCode}
                onClick={handleSendAgainEmailOTPCode}
                size="sm"
                variant="light"
              >
                {t("modalConfirmEmail.buttonSendAgainEmailOTPCode")}
              </Button>
              <Button size="sm" type="submit">
                {t("modalConfirmEmail.buttonSubmit")}
              </Button>
            </>
          }
          description={t("modalConfirmEmail.description")}
          isInModal
          title={t("modalConfirmEmail.title")}
        >
          <Collapse opened={isOtpCodeDisabled && !!validOTPCode}>
            {isOtpCodeDisabled && validOTPCode && (
              <Flex align="center" justify="center">
                <Text c={platformColor} fw="bold" pb={24} size="sm" truncate>
                  {validOTPCode}
                </Text>
              </Flex>
            )}
          </Collapse>
          <InputCode
            key={form.key(formNames.code)}
            name={formNames.code}
            {...form.getInputProps(formNames.code)}
          />
        </Section>
      </Form>
    </Modal>
  );
};

export const ModalWrapper = (
  properties: PropsWithChildren<T_ModalConfirmEmail>,
) => {
  return (
    <WrapperRemoveOnHidden opened={properties.opened}>
      {({ visible }) => <ModalConfirmEmail {...properties} opened={visible} />}
    </WrapperRemoveOnHidden>
  );
};

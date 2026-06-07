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
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Z_CodeString } from "~/models/code";
import { Form } from "~/ui/Form";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

import { Button } from "../Button";
import { ButtonArrowLeft } from "../ButtonArrowLeft";
import { Collapse } from "../Collapse";
import { InputCode } from "../InputCode";
import { Modal } from "../Modal";
import { Section } from "../Section";
import { Text } from "../Text";
import { WrapperRemoveOnHidden } from "../WrapperRemoveOnHidden";

type T_ModalConfirmPhone = {
  onClose?: () => void;
  onSuccess?: () => void;
  opened: boolean;
  phoneCode?: string;
  toCompany?: boolean;
  withButtonRollBack?: boolean;
};

export const ModalConfirmPhone = ({
  onClose,
  onSuccess,
  opened,
  phoneCode,
  toCompany,
  withButtonRollBack,
}: T_ModalConfirmPhone) => {
  const [sendedAgainPhoneCode, setSendedAgainPhoneCode] = useState(false);

  const { t } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { isOtpCodeDisabled } = useCookies();
  const { getLocalizedRoute } = useLocalizedRoute();
  const { platformColor } = useLayout();
  const fetcher = useFetcherWithActions({
    schema: z.object({
      codePhone: Z_CodeString.nullable().optional(),
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

  const validOTPCode = fetcher.data?.codePhone ?? phoneCode;
  useEffect(() => {
    if (
      fetcher.data?.message === "successOnVerifiedSMS" ||
      fetcher.data?.message === "successRollBackPhoneToVerified"
    ) {
      if (onSuccess) {
        onSuccess();
      } else {
        onClose?.();
      }
    }
  }, [fetcher]);

  const handleSendAgainPhoneCode = useCallback(() => {
    setSendedAgainPhoneCode(true);
    fetcher.submit(null, {
      action: getLocalizedRoute({
        route: toCompany ? E_Routes.companyPhone : E_Routes.accountPhone,
      }),
      method: "post",
    });
  }, [fetcher, getLocalizedRoute, toCompany]);

  const handleRollBackChanges = useCallback(() => {
    fetcher.submit(null, {
      action: getLocalizedRoute({
        route: toCompany ? E_Routes.companyPhone : E_Routes.accountPhone,
      }),
      method: "delete",
    });
  }, [fetcher, getLocalizedRoute, toCompany]);

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
          route: toCompany ? E_Routes.companyPhone : E_Routes.accountPhone,
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
              {withButtonRollBack && (
                <Button
                  color="red"
                  onClick={handleRollBackChanges}
                  size="sm"
                  variant="light"
                >
                  {t("modalConfirmPhone.buttonDelete")}
                </Button>
              )}
              <Button
                disabled={sendedAgainPhoneCode}
                onClick={handleSendAgainPhoneCode}
                size="sm"
                variant="light"
              >
                {t("modalConfirmPhone.buttonSendAgainPhoneCode")}
              </Button>
              <Button size="sm" type="submit">
                {t("modalConfirmPhone.buttonSubmit")}
              </Button>
            </>
          }
          description={t("modalConfirmPhone.description")}
          isInModal
          title={
            toCompany
              ? t("modalConfirmPhone.titleToCompany")
              : t("modalConfirmPhone.title")
          }
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
  properties: PropsWithChildren<T_ModalConfirmPhone>,
) => {
  return (
    <WrapperRemoveOnHidden opened={properties.opened}>
      {({ visible }) => <ModalConfirmPhone {...properties} opened={visible} />}
    </WrapperRemoveOnHidden>
  );
};

import { Flex } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import type { PropsWithChildren, SyntheticEvent } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { InputCode } from "~/ui/InputCode";
import { Modal } from "~/ui/Modal";
import { Section } from "~/ui/Section";
import { showAllErrorsForm } from "~/utilities/form";

import { ButtonArrowLeft } from "../ButtonArrowLeft";
import { ButtonSave } from "../ButtonSave";
import { WrapperRemoveOnHidden } from "../WrapperRemoveOnHidden";

type T_ModalAccountAuthenticator2Fa = {
  onClose: () => void;
  onSuccess: (code: string) => void;
  opened: boolean;
};

export const ModalAccountAuthenticator2Fa = ({
  onClose,
  onSuccess,
  opened,
}: T_ModalAccountAuthenticator2Fa) => {
  const { t } = useTranslation(namespaces.accountAuthenticator);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { getLocalizedRoute } = useLocalizedRoute();
  const { user } = useUser({
    requireSession: false,
  });
  const fetcher = useFetcherWithActions({
    schema: z.object({
      qrCode: z.string().nullable().optional(),
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

  useEffect(() => {
    if (!opened || user?.authenticator2FA?.enabledAt) {
      return;
    }

    fetcher.load(
      `${getLocalizedRoute({
        route: E_Routes.apiAccountAuthenticatorNew2FA,
      })}`,
    );
  }, [opened, user]);

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    if (!values[formNames.code]) {
      return;
    }

    onSuccess(values[formNames.code]);
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
    <Modal opened={opened} size="xl" zIndex={2020}>
      <form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          alert={
            user?.authenticatorEmailOTP?.enabledAt ? t("2fa.alert") : undefined
          }
          buttons={
            <>
              <ButtonArrowLeft onClick={onClose} size="sm" />
              <ButtonSave size="sm" type="submit" />
            </>
          }
          description={t("2fa.description")}
          isInModal
          title={t("2fa.title")}
        >
          <Flex justify="center" mb={24}>
            {fetcher?.data?.qrCode && (
              <QRCode level="L" size={160} value={fetcher?.data?.qrCode} />
            )}
          </Flex>
          <InputCode
            key={form.key(formNames.code)}
            name={formNames.code}
            {...form.getInputProps(formNames.code)}
          />
        </Section>
      </form>
    </Modal>
  );
};

export const ModalWrapper = (
  properties: PropsWithChildren<T_ModalAccountAuthenticator2Fa>,
) => {
  return (
    <WrapperRemoveOnHidden opened={properties.opened}>
      {({ visible }) => (
        <ModalAccountAuthenticator2Fa {...properties} opened={visible} />
      )}
    </WrapperRemoveOnHidden>
  );
};

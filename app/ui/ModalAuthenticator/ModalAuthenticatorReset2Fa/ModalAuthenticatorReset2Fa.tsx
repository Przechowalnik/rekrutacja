import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { type SyntheticEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Input } from "~/ui/Input";
import { Modal } from "~/ui/Modal";
import { Section } from "~/ui/Section";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

type T_ModalAuthenticatorReset2Fa = {
  handleCloseAllAuthenticator: () => void;
  onClose: () => void;
  opened: boolean;
  userId: null | string;
};

export const ModalAuthenticatorReset2Fa = ({
  handleCloseAllAuthenticator,
  onClose,
  opened,
  userId,
}: T_ModalAuthenticatorReset2Fa) => {
  const { t } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { getLocalizedRoute } = useLocalizedRoute();
  const navigate = useNavigate();
  const fetcher = useFetcherWithActions({});

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.codeReset2FA]: "",
    },
    mode: "uncontrolled",
    validate: {
      [formNames.codeReset2FA]: value =>
        checkFormValidator({ formName: formNames.codeReset2FA, value }),
    },
  });

  useEffect(() => {
    if (fetcher?.data?.message !== "recoveryReset2FAAccountSuccess") {
      return;
    }

    handleCloseAllAuthenticator();
    navigate(".");
  }, [fetcher]);

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    if (!userId) {
      notifications.show({
        color: "red",
        message: tNotifications(`somethingWentWrong.message`),
        title: tNotifications(`somethingWentWrong.title`),
      });
    }

    fetcher.submit(
      convertToFormData({ ...values, [formNames.userId]: userId }),
      {
        action: getLocalizedRoute({
          route: E_Routes.apiRecoveryAccountReset2FA,
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
    <Modal opened={opened} size="md" zIndex={2020}>
      <form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          buttons={
            <>
              <ButtonArrowLeft onClick={onClose} size="sm" />
              <Button size="sm" type="submit">
                {t("modalAuthenticator.reset2FA.buttonSubmit")}
              </Button>
            </>
          }
          description={t("modalAuthenticator.reset2FA.description")}
          isInModal
          title={t("modalAuthenticator.reset2FA.title")}
        >
          <Input
            clearable
            form={form}
            key={form.key(formNames.codeReset2FA)}
            name={formNames.codeReset2FA}
            required
            type="text"
            {...form.getInputProps(formNames.codeReset2FA)}
          />
        </Section>
      </form>
    </Modal>
  );
};

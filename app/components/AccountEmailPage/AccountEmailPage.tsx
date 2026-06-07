import { Box } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { SyntheticEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Z_CodeString } from "~/models/code";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

const ModalConfirmEmail = dynamic(() =>
  import("~/ui/ModalConfirmEmail").then(module => ({
    default: module.ModalConfirmEmail,
  })),
);

export const AccountEmailPage = () => {
  const [haveChanges, setHaveChanges] = useState(false);
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
  const [formData, setFormData] = useState<{
    email: string;
  } | null>(null);

  const { user } = useUser();
  const { platformColor } = useLayout();
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t } = useTranslation(namespaces.accountEmail);
  const navigate = useNavigate();
  const { getLocalizedRoute } = useLocalizedRoute();
  const fetcher = useFetcherWithActions({
    schema: z.object({
      code: Z_CodeString.optional(),
    }),
  });

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.email]: "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      const isDataTheSame = compareObjects({
        ignoreCaseInsensitive: true,
        object1: values,
        object2: {
          [formNames.email]: user?.email,
        },
      });
      setHaveChanges(!isDataTheSame);
    },
    validate: {
      [formNames.email]: value =>
        checkFormValidator({ formName: formNames.email, value }),
    },
  });

  useEffect(() => {
    if (fetcher?.data?.message !== "sendedCodeToConfirmEmail") {
      return;
    }

    setConfirmEmailOpen(true);
  }, [fetcher.data]);

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    if (user?.email?.toLowerCase() === values[formNames.email].toLowerCase()) {
      notifications.show({
        color: "red",
        message: tNotifications(`newUserEmailTheSame.message`),
        title: tNotifications(`newUserEmailTheSame.title`),
      });
      return;
    }

    setFormData({
      email: values[formNames.email],
    });

    setAuthenticatorOpen(true);
  };

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorOpen(false);

      if (!formData) {
        return;
      }

      fetcher.submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.email]: formData.email,
        }),
        {
          action: getLocalizedRoute({
            route: E_Routes.accountEmail,
          }),
          method: "patch",
        },
      );
    },
    [form, setAuthenticatorOpen, fetcher, formData],
  );

  const handleCloseConfirmEmail = useCallback(() => {
    setConfirmEmailOpen(false);
  }, []);

  const handleOnSuccessConfirmEmail = () => {
    setConfirmEmailOpen(false);
    navigate(
      getLocalizedRoute({
        route: E_Routes.account,
      }),
    );
  };

  return (
    <>
      <ModalAuthenticator
        onClose={handleCloseAuthenticator}
        onSuccess={handleAuthenticatorOnSuccess}
        opened={authenticatorOpen}
      />
      <ModalConfirmEmail
        emailOTPCode={fetcher?.data?.code}
        onClose={handleCloseConfirmEmail}
        onSuccess={handleOnSuccessConfirmEmail}
        opened={confirmEmailOpen}
      />
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          breadcrumbs={[E_Routes.home, E_Routes.account, E_Routes.accountEmail]}
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
            route: E_Routes.accountEmail,
          }}
          size="md"
          title={t("title")}
        >
          <Box className="center" pb={48}>
            <Text fw="bold">{t("currentEmail")}</Text>
            <Text c={platformColor} fw="bold">
              {user?.email}
            </Text>
          </Box>
          <InputWrapper>
            <Input
              key={form.key(formNames.email)}
              label={t("inputNewEmail")}
              name={formNames.email}
              required
              type="email"
              {...form.getInputProps(formNames.email)}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};

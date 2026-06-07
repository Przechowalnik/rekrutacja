import { Box, Group } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { type SyntheticEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes, routesExtra } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useCompanyWorker } from "~/hooks/useCompanyWorker";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { E_CompanyWorkerPermissions, E_Roles } from "~/models/enums";
import { Avatar } from "~/ui/Avatar";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonGetImages } from "~/ui/ButtonGetImages";
import { ButtonSave } from "~/ui/ButtonSave";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Link } from "~/ui/Link";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

export const CompanyWorkerProfilePage = () => {
  const [newAvatar, setNewAvatar] = useState<null | string>(null);
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);
  const [haveChanges, setHaveChanges] = useState(false);

  const { t } = useTranslation(namespaces.companyWorkerProfile);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { user } = useUser();
  const { companyWorker } = useCompanyWorker();
  const { platformColor } = useLayout();
  const fetcher = useFetcherWithActions({});
  const { getLocalizedRoute } = useLocalizedRoute();
  const actionData = useActionData<{
    message?: string;
  }>();

  const isEditable =
    user?.role === E_Roles.B2B_OWNER ||
    (user?.role === E_Roles.B2B_WORKER &&
      user?.workerSettings?.permissions?.includes(
        E_CompanyWorkerPermissions.MANAGE_WORKERS,
      ));

  const isOwner = companyWorker?.role === E_Roles.B2B_OWNER;

  const linkGoBack = getLocalizedRoute({
    extraPath: `/${companyWorker?.id}`,
    route: E_Routes.companyWorkerEdit,
  });

  const linkCurrent = getLocalizedRoute({
    extraPath: `/${companyWorker?.id}${routesExtra[E_Routes.companyWorkerEdit].profile}`,
    route: E_Routes.companyWorkerEdit,
  });

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.userFirstName]: companyWorker?.firstName ?? "",
      [formNames.userLastName]: companyWorker?.lastName ?? "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      const hasChangesInFirstName =
        companyWorker?.firstName !== values[formNames.userFirstName];
      const hasChangesInLastName =
        companyWorker?.lastName !== values[formNames.userLastName];

      setHaveChanges(hasChangesInFirstName || hasChangesInLastName);
    },
    validate: {
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
    if (
      actionData?.message === "successUpdateAccount" ||
      fetcher?.data?.message === "successUpdateAccount"
    ) {
      setNewAvatar(null);
    }
  }, [actionData, fetcher]);

  const handleSubmit = (
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    if (!isEditable) {
      return;
    }

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

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleNotSaveAvatar = useCallback(() => {
    setNewAvatar(null);
  }, []);

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      if (!isEditable) {
        return;
      }

      setAuthenticatorOpen(false);

      const formData = form.getValues();

      if (!formData) {
        return;
      }

      submit(
        convertToFormData({
          ...formData,
          [formNames.authenticator]: authenticator,
        }),
        {
          action: linkCurrent,
          method: "patch",
        },
      );
    },
    [form, isEditable],
  );

  const handleSaveNewAvatar = useCallback(async () => {
    try {
      if (!isEditable) {
        return;
      }

      if (!newAvatar) {
        notifications.show({
          color: "red",
          message: tNotifications(`somethingWentWrong.message`),
          title: tNotifications(`somethingWentWrong.title`),
        });
        return;
      }

      fetcher.submit(
        convertToFormData({
          [formNames.fileImage2MB]: newAvatar,
        }),
        {
          action: linkCurrent,
          encType: "multipart/form-data",
          method: "post",
        },
      );
    } catch {
      notifications.show({
        color: "red",
        message: tNotifications(`somethingWentWrong.message`),
        title: tNotifications(`somethingWentWrong.title`),
      });
      return;
    }
  }, [newAvatar, isEditable, linkCurrent]);

  const handleChangeAvatar = useCallback((filesBase64: string[]) => {
    const foundFirstImage = filesBase64.at(0);
    if (!foundFirstImage) {
      notifications.show({
        color: "red",
        message: tNotifications(`somethingWentWrong.message`),
        title: tNotifications(`somethingWentWrong.title`),
      });
      return;
    }

    setNewAvatar(foundFirstImage);
  }, []);

  const handleDeleteAvatar = useCallback(() => {
    if (!isEditable) {
      return;
    }

    fetcher.submit(
      {},
      {
        action: linkCurrent,
        method: "delete",
      },
    );
  }, [isEditable, linkCurrent]);

  if (!companyWorker) {
    return null;
  }

  return (
    <>
      {isEditable && (
        <ModalAuthenticator
          onClose={handleCloseAuthenticator}
          onSuccess={handleAuthenticatorOnSuccess}
          opened={authenticatorOpen}
        />
      )}
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          breadcrumbs={[
            E_Routes.home,
            E_Routes.company,
            E_Routes.companyWorkers,
            {
              customHref: linkGoBack,
              customTitle: `${companyWorker?.firstName ?? ""} ${companyWorker?.lastName?.at(0)}.`,
            },
            {
              customHref: linkCurrent,
              customTitle: tCommon("breadcrumbs.companyWorkerEditProfile"),
            },
          ]}
          buttons={
            <>
              <Link fullWidthOnMobile to={linkGoBack}>
                <ButtonArrowLeft textGoBack={!isEditable} />
              </Link>
              {isEditable && (
                <ButtonSave
                  disabled={!haveChanges}
                  tooltip={{
                    label: tCommon("buttonSaveTooltip"),
                  }}
                  type="submit"
                />
              )}
            </>
          }
          description={isEditable ? t("description") : undefined}
          pageMeta={{
            route: E_Routes.companyWorkerEdit,
          }}
          size="md"
          title={isOwner ? t("titleOwner") : t("title")}
        >
          <Text center fw="bold" mb={isEditable ? 0 : 4}>
            {t("imageProfile")}
          </Text>
          {isEditable && (
            <Text c="gray" center mb={4} size="sm" withHTML>
              {t("imageInformation")}
            </Text>
          )}
          <Avatar
            name={`${companyWorker.firstName.slice(0, 2).toUpperCase()}`}
            size="xl"
            url={
              newAvatar
                ? newAvatar.toString()
                : companyWorker?.avatar || undefined
            }
          />
          {isEditable && (
            <Group justify="center" mt={12}>
              {!newAvatar && !companyWorker?.avatar && (
                <ButtonGetImages
                  label={t("buttonAddImage")}
                  maxSizeMB={2}
                  maxWidthOrHeight={512}
                  multiple={false}
                  onChange={handleChangeAvatar}
                />
              )}
              {newAvatar && !companyWorker?.avatar && (
                <>
                  <Button
                    color="red"
                    onClick={handleNotSaveAvatar}
                    size="sm"
                    variant="light"
                  >
                    {t("buttonNoSaveImage")}
                  </Button>
                  <Button onClick={handleSaveNewAvatar} size="sm">
                    {t("buttonSaveImage")}
                  </Button>
                </>
              )}
              {companyWorker?.avatar && (
                <Button
                  color="red"
                  onClick={handleDeleteAvatar}
                  size="sm"
                  variant="light"
                >
                  {t("buttonDeleteImage")}
                </Button>
              )}
            </Group>
          )}
          <Box className="center" pb={48} pt={48}>
            <Text fw="bold">{t("currentAccountName")}</Text>
            <Text c={platformColor} fw="bold">
              {companyWorker?.firstName ?? ""} {companyWorker?.lastName ?? ""}
            </Text>
          </Box>
          {isEditable && (
            <InputWrapper>
              <Input
                key={form.key(formNames.userFirstName)}
                name={formNames.userFirstName}
                required
                {...form.getInputProps(formNames.userFirstName)}
                disabled={!isEditable}
                disabledWithOpacity={false}
              />
              <Input
                form={form}
                key={form.key(formNames.userLastName)}
                name={formNames.userLastName}
                required={false}
                {...form.getInputProps(formNames.userLastName)}
                disabled={!isEditable}
                disabledWithOpacity={false}
              />
            </InputWrapper>
          )}
        </Section>
      </Form>
    </>
  );
};

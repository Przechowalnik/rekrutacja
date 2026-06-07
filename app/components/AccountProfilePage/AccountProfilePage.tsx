import { Box, Group } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { type SyntheticEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Avatar } from "~/ui/Avatar";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonGetImages } from "~/ui/ButtonGetImages";
import { ButtonSave } from "~/ui/ButtonSave";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

export const AccountProfilePage = () => {
  const [newAvatar, setNewAvatar] = useState<null | string>(null);
  const [haveChanges, setHaveChanges] = useState(false);

  const { t } = useTranslation(namespaces.accountProfile);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { user } = useUser();
  const { platformColor } = useLayout();
  const { getLocalizedRoute } = useLocalizedRoute();
  const fetcher = useFetcherWithActions({
    onSuccess: () => {
      setNewAvatar(null);
    },
  });

  const linkCurrent = getLocalizedRoute({
    route: E_Routes.accountProfile,
  });

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.userFirstName]: user?.firstName ?? "",
      [formNames.userLastName]: user?.lastName ?? "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      const hasChangesInFirstName =
        user?.firstName !== values[formNames.userFirstName];
      const hasChangesInLastName =
        user?.lastName !== values[formNames.userLastName];

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

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    submit(
      convertToFormData({
        ...values,
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.accountProfile,
        }),
        method: "patch",
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

  const handleNotSaveAvatar = useCallback(() => {
    setNewAvatar(null);
  }, []);

  const handleSaveNewAvatar = useCallback(async () => {
    try {
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
  }, [newAvatar, linkCurrent]);

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
    fetcher.submit(
      {},
      {
        action: linkCurrent,
        method: "delete",
      },
    );
  }, [linkCurrent]);

  if (!user) {
    return null;
  }

  return (
    <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
      <Section
        breadcrumbs={[E_Routes.home, E_Routes.account, E_Routes.accountProfile]}
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
        description={
          user?.company ? t("descriptionWithCompany") : t("description")
        }
        pageMeta={{
          route: E_Routes.accountProfile,
        }}
        size="md"
        title={t("title")}
      >
        <Text center fw="bold">
          {t("imageProfile")}
        </Text>
        <Text c="gray" center mb={4} size="sm" withHTML>
          {t("imageInformation")}
        </Text>
        <Avatar
          name={user.firstName.slice(0, 2).toUpperCase()}
          size="xl"
          url={newAvatar ? newAvatar.toString() : user?.avatar || undefined}
        />
        <Group justify="center" mt={12}>
          {!newAvatar && !user?.avatar && (
            <ButtonGetImages
              label={t("buttonAddImage")}
              maxSizeMB={2}
              maxWidthOrHeight={512}
              multiple={false}
              onChange={handleChangeAvatar}
            />
          )}
          {newAvatar && !user?.avatar && (
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
          {user?.avatar && (
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
        <Box className="center" pb={48} pt={48}>
          <Text fw="bold">{t("currentAccountName")}</Text>
          <Text c={platformColor} fw="bold">
            {user?.firstName ?? ""}
            {user?.lastName ? ` ${user?.lastName}` : ""}
          </Text>
        </Box>
        <InputWrapper>
          <Input
            key={form.key(formNames.userFirstName)}
            name={formNames.userFirstName}
            required
            {...form.getInputProps(formNames.userFirstName)}
          />
          <Input
            form={form}
            key={form.key(formNames.userLastName)}
            name={formNames.userLastName}
            required={false}
            {...form.getInputProps(formNames.userLastName)}
          />
        </InputWrapper>
      </Section>
    </Form>
  );
};

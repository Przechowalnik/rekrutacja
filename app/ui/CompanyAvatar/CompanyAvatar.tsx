import { Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUser } from "~/hooks/useUser";
import { formNames } from "~/lib/zodFormValidator";
import { Text } from "~/ui/Text";
import { convertToFormData } from "~/utilities/form";

import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { ButtonGetImages } from "../ButtonGetImages";

type T_CompanyAvatar = {
  withTexts?: boolean;
};

export const CompanyAvatar = ({ withTexts = true }: T_CompanyAvatar) => {
  const [newAvatar, setNewAvatar] = useState<null | string>(null);

  const { t } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { user } = useUser();
  const fetcher = useFetcherWithActions({});
  const { getLocalizedRoute } = useLocalizedRoute();

  const linkCurrent = getLocalizedRoute({
    route: E_Routes.companyProfile,
  });

  useEffect(() => {
    setNewAvatar(null);
  }, [user?.company?.avatar]);

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

  const handleDeleteAvatar = useCallback(() => {
    fetcher.submit(
      {},
      {
        action: linkCurrent,
        method: "delete",
      },
    );
  }, [linkCurrent]);

  if (!user?.company) {
    return null;
  }

  return (
    <Flex align="flex-start" direction="column" justify="flex-start">
      {withTexts && (
        <>
          <Text fw="bold">{t("companyAvatar.title")}</Text>
          <Text c={colorsMantine.dimmed} mb={8} size="sm" withTextsToUi>
            {t("companyAvatar.description")}
          </Text>
        </>
      )}
      <Flex align="center" direction="column" gap={12} justify="center" mt={12}>
        <Avatar
          name={user?.company?.name?.slice(0, 2)?.toUpperCase()}
          size="xl"
          url={newAvatar ?? user?.company?.avatar ?? undefined}
        />
        {!newAvatar && !user?.company?.avatar && (
          <ButtonGetImages
            label={t("companyAvatar.buttonAddImage")}
            maxSizeMB={2}
            maxWidthOrHeight={512}
            multiple={false}
            onChange={handleChangeAvatar}
          />
        )}
        {newAvatar && !user?.company?.avatar && (
          <>
            <Button
              color="red"
              onClick={handleNotSaveAvatar}
              size="sm"
              variant="light"
            >
              {t("companyAvatar.buttonNoSaveImage")}
            </Button>
            <Button onClick={handleSaveNewAvatar} size="sm">
              {t("companyAvatar.buttonSaveImage")}
            </Button>
          </>
        )}
        {user?.company?.avatar && (
          <Button
            color="red"
            onClick={handleDeleteAvatar}
            size="sm"
            variant="light"
          >
            {t("companyAvatar.buttonDeleteImage")}
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

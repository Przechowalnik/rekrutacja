import { faImage } from "@fortawesome/free-solid-svg-icons";
import { AspectRatio, Flex } from "@mantine/core";
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
import { Image } from "~/ui/Image";
import { Text } from "~/ui/Text";
import { convertToFormData } from "~/utilities/form";

import { Button } from "../Button";
import { ButtonGetImages } from "../ButtonGetImages";
import { IconSeo } from "../IconSeo";

type T_CompanyBanner = {
  onlyShow?: boolean;
  withTexts?: boolean;
};

export const CompanyBanner = ({
  onlyShow,
  withTexts = true,
}: T_CompanyBanner) => {
  const [newBanner, setNewBanner] = useState<null | string>(null);

  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { user } = useUser();
  const fetcher = useFetcherWithActions({});
  const { getLocalizedRoute } = useLocalizedRoute();

  const linkCurrent = getLocalizedRoute({
    route: E_Routes.apiCompanyBanner,
  });

  const hasBannerToShow = newBanner || user?.company?.bannerHero;

  useEffect(() => {
    setNewBanner(null);
  }, [user?.company?.bannerHero]);

  const handleChangeBanner = useCallback((filesBase64: string[]) => {
    const foundFirstImage = filesBase64.at(0);
    if (!foundFirstImage) {
      notifications.show({
        color: "red",
        message: tNotifications(`somethingWentWrong.message`),
        title: tNotifications(`somethingWentWrong.title`),
      });
      return;
    }

    setNewBanner(foundFirstImage);
  }, []);

  const handleNotSaveBanner = useCallback(() => {
    setNewBanner(null);
  }, []);

  const handleSaveNewBanner = useCallback(async () => {
    if (onlyShow) {
      return;
    }

    try {
      if (!newBanner) {
        notifications.show({
          color: "red",
          message: tNotifications(`somethingWentWrong.message`),
          title: tNotifications(`somethingWentWrong.title`),
        });
        return;
      }

      fetcher.submit(
        convertToFormData({
          [formNames.fileImage5MB]: newBanner,
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
  }, [newBanner, linkCurrent, onlyShow]);

  const handleDeleteBanner = useCallback(() => {
    if (onlyShow) {
      return;
    }

    fetcher.submit(
      {},
      {
        action: linkCurrent,
        method: "delete",
      },
    );
  }, [linkCurrent, onlyShow]);

  return (
    <>
      {withTexts && (
        <>
          <Text fw="bold">{t("companyBanner.title")}</Text>
          <Text c={colorsMantine.dimmed} mb={8} size="sm" withTextsToUi>
            {t("companyBanner.description")}
          </Text>
        </>
      )}
      {!hasBannerToShow && (
        <Flex
          align="center"
          bg={`light-dark(${colorsMantine.dark0}, ${colorsMantine.dark7})`}
          h={400}
          justify="center"
          maw="100%"
          style={{
            borderRadius: 20,
          }}
          w={1920}
        >
          <IconSeo color="white" icon={faImage} size="7x" />
        </Flex>
      )}
      {hasBannerToShow && (
        <AspectRatio h={400} ratio={16 / 9} w={1920}>
          <Image
            alt={tSeo("imagesAlt.imageCompanyBanner")}
            customSrc={(newBanner || user?.company?.bannerHero) ?? ""}
            h={400}
            maw="100%"
            radius={20}
            w={1920}
          />
        </AspectRatio>
      )}
      {!onlyShow && (
        <Flex align="center" gap={12} justify="flex-end" mt={12} w="100%">
          {!newBanner && !user?.company?.bannerHero && (
            <ButtonGetImages
              label={t("companyBanner.buttonAddImage")}
              maxSizeMB={5}
              maxWidthOrHeight={1024}
              multiple={false}
              onChange={handleChangeBanner}
            />
          )}
          {newBanner && !user?.company?.bannerHero && (
            <>
              <Button
                color="red"
                onClick={handleNotSaveBanner}
                size="sm"
                variant="light"
              >
                {t("companyBanner.buttonNoSaveImage")}
              </Button>
              <Button onClick={handleSaveNewBanner} size="sm">
                {t("companyBanner.buttonSaveImage")}
              </Button>
            </>
          )}
          {user?.company?.bannerHero && (
            <Button
              color="red"
              onClick={handleDeleteBanner}
              size="sm"
              variant="light"
            >
              {t("companyBanner.buttonDeleteImage")}
            </Button>
          )}
        </Flex>
      )}
    </>
  );
};

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMatches } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { useFlash } from "~/hooks/useFlash";
import { useLayout } from "~/hooks/useLayout";
import { useUser } from "~/hooks/useUser";
import { reduceToUniqueFields } from "~/utilities/functions";

export const GlobalRoutesAlerts = () => {
  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);
  const matches = useMatches();
  const { platformColor } = useLayout();
  const { flashData } = useFlash();
  const { user } = useUser({
    fetchUserIfNotExist: false,
    requireSession: false,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!user?.company?.settings?.twoFactorAuthenticationEnabledAt) {
      return;
    }

    if (
      user?.authenticator2FA?.enabledAt ||
      user?.authenticatorEmailOTP?.enabledAt
    ) {
      return;
    }
    notifications.show({
      color: "red",
      id: t("companySettingsNoDetectedEmailOtpOr2FA.title"),
      message: t("companySettingsNoDetectedEmailOtpOr2FA.message"),
      title: t("companySettingsNoDetectedEmailOtpOr2FA.title"),
    });
  }, [user]);

  useEffect(() => {
    if (!flashData?.message) {
      return;
    }

    let color = platformColor;
    if (flashData?.messageStatus === "error") {
      color = "red";
    } else if (flashData?.messageStatus === "success") {
      color = "green";
    }

    if (
      t(`${flashData.message}.title` as any) === `${flashData.message}.title`
    ) {
      return;
    }

    if (
      t(`${flashData.message}.message` as any) ===
      `${flashData.message}.message`
    ) {
      return;
    }

    notifications.show({
      color,
      id: t(`${flashData.message}.title` as any),
      message: t(`${flashData.message}.message` as any),
      title: t(`${flashData.message}.title` as any),
    });
  }, [flashData]);

  useEffect(() => {
    for (const item of matches) {
      const data = item as any;
      const message = data?.message;
      const isErrorStatus = (data?.status ?? 200) >= 400;

      if (typeof message === "string" && message) {
        notifications.show({
          color: isErrorStatus ? "red" : "green",
          id: t(`${message}.title` as any),
          message: t(`${message}.message` as any),
          title: t(`${message}.title` as any),
        });
      }

      if (data?.formErrors && Array.isArray(data.formErrors)) {
        const reducedArray = reduceToUniqueFields(data.formErrors);
        for (const formError of reducedArray) {
          notifications.show({
            color: isErrorStatus ? "red" : "green",
            // @ts-ignore
            id: `${t(`${formError?.message}.title`)} ${tCommon(`inputs.${formError?.field}`)}`,
            // @ts-ignore
            message: t(`${formError?.message}.message`),
            // @ts-ignore
            title: `${t(`${formError?.message}.title`)} ${tCommon(`inputs.${formError?.field}`)}`,
          });
        }
      }
    }
  }, [matches]);

  return null;
};

import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { useInstallPWA } from "~/hooks/useInstallPwa";

import { Button } from "../Button";

const ButtonPwaToMemoize = () => {
  const { t } = useTranslation(namespaces.common);
  const { canInstall, promptInstall } = useInstallPWA();

  if (!canInstall) {
    return null;
  }

  return <Button onClick={promptInstall}>{t("buttonPwa.button")}</Button>;
};

export const ButtonPwa = memo(ButtonPwaToMemoize);

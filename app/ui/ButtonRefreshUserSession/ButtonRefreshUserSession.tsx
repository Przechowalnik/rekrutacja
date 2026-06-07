import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { useUser } from "~/hooks/useUser";

import type { T_Button } from "../Button";
import { Button } from "../Button";
import { IconSeo } from "../IconSeo";

type T_ButtonRefreshUserSession = {
  customText?: string;
  onlyInDevelopmentMode?: boolean;
  refreshTimeout?: 10_000 | 5000;
};

export const ButtonRefreshUserSession = ({
  customText,
  onlyInDevelopmentMode,
  refreshTimeout = 5000,
  ...restProps
}: T_Button & T_ButtonRefreshUserSession) => {
  const [showButton, setShowButton] = useState(false);
  const [disabledButton, setDisabledButton] = useState(false);

  const { t } = useTranslation(namespaces.common);
  const { refreshData, user } = useUser();

  useEffect(() => {
    setShowButton(process.env.NODE_ENV === "development");
  }, []);

  const handleClickRefresh = useCallback(() => {
    setDisabledButton(true);
    refreshData();
    setTimeout(() => {
      setDisabledButton(false);
    }, refreshTimeout);
  }, []);

  if (!user) {
    return null;
  }

  if (onlyInDevelopmentMode && !showButton) {
    return null;
  }

  return (
    <Button
      color="orange"
      disabled={disabledButton}
      leftSection={
        <IconSeo icon={faArrowsRotate} size="lg" spin={disabledButton} />
      }
      onClick={handleClickRefresh}
      variant="filled"
      {...restProps}
    >
      {customText ?? t("buttonRefresh")}
    </Button>
  );
};

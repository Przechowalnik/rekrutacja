import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";

import { Button, type T_Button } from "../Button";
import { IconSeo } from "../IconSeo";

type T_ButtonArrowLeft = {
  ariaLabel?: string;
  textClose?: boolean;
  textGoBack?: boolean;
};

export const ButtonArrowLeft = ({
  textClose,
  textGoBack,
  variant = "light",
  ...restProps
}: T_Button & T_ButtonArrowLeft) => {
  const { t } = useTranslation(namespaces.common);

  return (
    <Button
      leftSection={<IconSeo icon={faArrowLeft} size="lg" />}
      {...restProps}
      ariaLabel={
        textClose
          ? t("buttonArrowLeft.close")
          : textGoBack
            ? t("buttonArrowLeft.goBack")
            : t("buttonArrowLeft.cancel")
      }
      variant={variant}
    >
      {textClose
        ? t("buttonArrowLeft.close")
        : textGoBack
          ? t("buttonArrowLeft.goBack")
          : t("buttonArrowLeft.cancel")}
    </Button>
  );
};

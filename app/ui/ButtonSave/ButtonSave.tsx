import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";

import { Button, type T_Button } from "../Button";

type T_ButtonSave = {
  textAdd?: boolean;
};

export const ButtonSave = ({
  textAdd,
  ...restProps
}: T_Button & T_ButtonSave) => {
  const { t } = useTranslation(namespaces.common);

  return (
    <Button {...restProps}>
      {textAdd ? t("buttonSave.add") : t("buttonSave.save")}
    </Button>
  );
};

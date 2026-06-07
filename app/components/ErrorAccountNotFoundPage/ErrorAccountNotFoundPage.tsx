import { Center } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ErrorResponse } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { CardInfo } from "~/ui/CardInfo";

type T_ErrorAccountNotFoundPage = {
  errorText?: ErrorResponse;
};

export const ErrorAccountNotFoundPage = ({
  errorText,
}: T_ErrorAccountNotFoundPage) => {
  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);

  if (errorText) {
    console.error(errorText?.status);
  }

  return (
    <Center inset={0} pos="fixed">
      <CardInfo
        button={{
          link: E_Routes.login,
          text: tCommon("goToLoginPage"),
        }}
        description={t("accountNotFound.message")}
        title={t("accountNotFound.title")}
        w="680px"
      />
    </Center>
  );
};

import { Center } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ErrorResponse } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { CardInfo } from "~/ui/CardInfo";

type T_ErrorPage = {
  errorText?: ErrorResponse;
};

export const ErrorPage = ({ errorText }: T_ErrorPage) => {
  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);

  if (errorText) {
    console.error(errorText?.status);
  }

  return (
    <Center inset={0} pos="fixed">
      <CardInfo
        button={{
          link: E_Routes.home,
          text: tCommon("goToHomePage"),
        }}
        title={t("somethingWentWrong.title")}
      />
    </Center>
  );
};

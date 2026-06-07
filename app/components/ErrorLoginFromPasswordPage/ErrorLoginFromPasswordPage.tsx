import { Center } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ErrorResponse } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useUserCookie } from "~/hooks/useUserCookie";
import { CardInfo } from "~/ui/CardInfo";

type T_ErrorLoginFromPasswordPage = {
  errorText?: ErrorResponse;
};

export const ErrorLoginFromPasswordPage = ({
  errorText,
}: T_ErrorLoginFromPasswordPage) => {
  const { t } = useTranslation(namespaces.notifications);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { userCookie } = useUserCookie();

  if (errorText) {
    console.error(errorText?.status);
  }

  return (
    <Center inset={0} pos="fixed">
      <CardInfo
        button={{
          link: userCookie ? E_Routes.home : E_Routes.login,
          text: tCommon("goToLoginPage"),
        }}
        description={t("loginFromPassword.message")}
        title={t("loginFromPassword.title")}
        w="700px"
      />
    </Center>
  );
};

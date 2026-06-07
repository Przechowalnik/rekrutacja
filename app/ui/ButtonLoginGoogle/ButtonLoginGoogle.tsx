import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUserCookie } from "~/hooks/useUserCookie";

import { Button } from "../Button";
import { IconSeo } from "../IconSeo";

export const ButtonLoginGoogle = () => {
  const { t: tCommon } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();
  const { userCookie } = useUserCookie();

  const handleLogin = useCallback(() => {
    globalThis.location.assign(
      getLocalizedRoute({
        route: E_Routes.loginGoogle,
      }),
    );
  }, [getLocalizedRoute]);

  if (userCookie) {
    return null;
  }

  return (
    <Button
      color="black"
      leftSection={<IconSeo icon={faGoogle} size="xl" />}
      onClick={handleLogin}
      variant="filled"
    >
      {tCommon("buttonLoginGoogle.button")}
    </Button>
  );
};

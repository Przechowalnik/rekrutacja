import { type PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router";

import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUserCookie } from "~/hooks/useUserCookie";

export const RespectNotLoggedUser = ({ children }: PropsWithChildren) => {
  const { getLocalizedRoute } = useLocalizedRoute();
  const { userCookie } = useUserCookie();
  const navigate = useNavigate();

  useEffect(() => {
    if (userCookie) {
      navigate(getLocalizedRoute({ route: E_Routes.home }));
      return;
    }
  }, [userCookie, getLocalizedRoute, navigate]);

  if (userCookie) {
    return null;
  }

  return <>{children}</>;
};

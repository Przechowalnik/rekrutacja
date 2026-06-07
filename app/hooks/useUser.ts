import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";

import { E_Routes } from "~/constants/routes";
import type { T_UserContext } from "~/context/UserContext";
import { UserContext } from "~/context/UserContext";

import { useLocalizedRoute } from "./useLocalizedRoute";

export function useUser(properties?: {
  fetchUserIfNotExist?: boolean;
  requireSession: boolean;
}): T_UserContext {
  const propertiesUserContext = useContext(UserContext);
  const navigate = useNavigate();
  const { getLocalizedRoute } = useLocalizedRoute();

  const { isAfterGetUser, isUserFetching, refreshData, user, userCookie } =
    propertiesUserContext;

  useEffect(() => {
    const validFetchUserIfNotExist =
      typeof properties?.fetchUserIfNotExist === "boolean"
        ? properties?.fetchUserIfNotExist
        : true;
    const validRequireSession =
      typeof properties?.requireSession === "boolean"
        ? properties?.requireSession
        : true;

    if (user || isUserFetching) {
      return;
    }

    if (userCookie && !isAfterGetUser && validFetchUserIfNotExist) {
      refreshData();
      return;
    }

    if (!validRequireSession || !isAfterGetUser) {
      return;
    }

    navigate(
      getLocalizedRoute({
        route: E_Routes.login,
      }),
    );
  }, [user, isAfterGetUser, userCookie, properties]);

  return propertiesUserContext;
}

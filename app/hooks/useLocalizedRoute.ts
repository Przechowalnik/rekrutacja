import { useCallback } from "react";
import { useLocation } from "react-router";

import {
  getRoute,
  type T_GetRoute,
  type T_RouteValue,
} from "~/constants/routes";
import { E_Language } from "~/models/enums";

const englishPrefix = `/${E_Language.EN.toLowerCase()}`;

export type T_GetLocalizedRoute = (parameters: T_GetRoute) => T_RouteValue;

export const useLocalizedRoute = () => {
  const location = useLocation();
  const isEnglish =
    location.pathname.startsWith(`${englishPrefix}/`) ||
    location.pathname === englishPrefix;

  const getLocalizedRoute = useCallback(
    (parameters: T_GetRoute): T_RouteValue => {
      const basePath = getRoute(parameters);

      // Don't add prefix for API routes or if already has /en prefix
      if (basePath.startsWith("/api") || basePath.startsWith(englishPrefix)) {
        return basePath;
      }

      return isEnglish
        ? (`${englishPrefix}${basePath}` as T_RouteValue)
        : basePath;
    },
    [isEnglish],
  );

  return { getLocalizedRoute, isEnglish };
};

import { type PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router";

import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { isFreeListings } from "~/utilities/flags";

export const RespectNotFreeListings = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const { getLocalizedRoute } = useLocalizedRoute();

  useEffect(() => {
    if (isFreeListings()) {
      navigate(getLocalizedRoute({ route: E_Routes.home }));
      return;
    }
  }, []);

  if (isFreeListings()) {
    return null;
  }

  return <>{children}</>;
};

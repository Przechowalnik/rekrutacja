import { type PropsWithChildren, useEffect } from "react";
import { useNavigate } from "react-router";

import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { isEnableCreateOrLoginCompany } from "~/utilities/flags";

export const RespectCreateOrLoginCompany = ({
  children,
}: PropsWithChildren) => {
  const navigate = useNavigate();
  const { getLocalizedRoute } = useLocalizedRoute();

  useEffect(() => {
    if (!isEnableCreateOrLoginCompany()) {
      navigate(getLocalizedRoute({ route: E_Routes.home }));
      return;
    }
  }, []);

  if (!isEnableCreateOrLoginCompany()) {
    return null;
  }

  return <>{children}</>;
};

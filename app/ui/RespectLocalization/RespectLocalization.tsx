import { PropsWithChildren, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { T_Namespaces } from "~/constants/namespaces";
import { useLoading } from "~/hooks/useLoading";

type T_RespectLocalization = {
  namespaces: T_Namespaces[];
};

export const RespectLocalization = ({
  children,
  namespaces,
}: PropsWithChildren<T_RespectLocalization>) => {
  const { ready } = useTranslation(namespaces, { useSuspense: false });
  const { onChangeLoadingLocalization } = useLoading();

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChangeLoadingLocalization({
        duration: 100,
        value: !ready,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [ready]);

  return children;
};

import type { T_Namespaces } from "~/constants/namespaces";
import { namespaces } from "~/constants/namespaces";

type T_GetI18nextNamespaces = {
  extraNamespaces: T_Namespaces[];
};

export const getI18nextNamespaces = ({
  extraNamespaces = [],
}: T_GetI18nextNamespaces) => {
  return {
    i18n: [
      namespaces.common,
      namespaces.notifications,
      namespaces.questions,
      namespaces.modals,
      namespaces.seo,
      ...extraNamespaces,
    ],
  };
};

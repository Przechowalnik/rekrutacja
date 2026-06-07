import { useContext } from "react";

import { LoadingContext } from "~/context/LoadingContext";

export const useLoading = () => {
  const properties = useContext(LoadingContext);

  return properties;
};

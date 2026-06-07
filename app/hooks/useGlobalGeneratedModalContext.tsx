import { useContext } from "react";

import { GlobalGeneratedModalContext } from "~/context/GlobalGeneratedModalContext";

export const useGlobalGeneratedModalContext = () => {
  const properties = useContext(GlobalGeneratedModalContext);

  return properties;
};

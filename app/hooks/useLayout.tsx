import { useContext } from "react";

import { LayoutContext } from "~/context/LayoutContext";

export const useLayout = () => {
  const layouts = useContext(LayoutContext);

  return layouts;
};

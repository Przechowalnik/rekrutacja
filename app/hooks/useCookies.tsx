import { useContext } from "react";

import { CookiesContext } from "~/context/CookiesContext";

export const useCookies = () => {
  const layouts = useContext(CookiesContext);

  return layouts;
};

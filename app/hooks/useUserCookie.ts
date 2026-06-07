import { useContext } from "react";

import { UserCookieContext } from "~/context/UserCookieContext";

export function useUserCookie() {
  const propertiesUserCookieContext = useContext(UserCookieContext);

  return propertiesUserCookieContext;
}

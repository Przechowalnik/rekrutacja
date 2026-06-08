import { useContext } from "react";

import { CookieConsentContext } from "~/context/CookieConsentContext";

export const useCookieConsent = () => {
  return useContext(CookieConsentContext);
};

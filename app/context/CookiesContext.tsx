import JSCookies from "js-cookie";
import type { PropsWithChildren } from "react";
import { createContext, useEffect, useMemo, useState } from "react";

import { cookiesKey } from "~/constants/cookies";
import {
  checkIsFlagEmailDisabledFrontend,
  checkIsFlagOtpCodeDisabledFrontend,
  checkIsFlagSMSDisabledFrontend,
  isShowDevelopmentHelpers,
  setFlagEmail,
  setFlagOtpCode,
  setFlagSMS,
} from "~/utilities/flags";

export type T_Cookies = {
  isEmailDisabled: boolean;
  isOtpCodeDisabled: boolean;
  isSMSDisabled: boolean;
  onToggleEmail: () => void;
  onToggleOtpCode: () => void;
  onToggleSMS: () => void;
};

export const CookiesContext = createContext<T_Cookies>({
  isEmailDisabled: false,
  isOtpCodeDisabled: false,
  isSMSDisabled: false,
  onToggleEmail: () => {},
  onToggleOtpCode: () => {},
  onToggleSMS: () => {},
});

export const CookiesContextProvider = ({ children }: PropsWithChildren) => {
  const [isOtpCodeDisabled, setIsOtpCodeDisabled] = useState<boolean>(false);
  const [isEmailDisabled, setIsEmailDisabled] = useState<boolean>(false);
  const [isSMSDisabled, setIsSMSDisabled] = useState<boolean>(false);

  useEffect(() => {
    const isEmailDisabledValue = checkIsFlagEmailDisabledFrontend();
    const isSMSDisabledValue = checkIsFlagSMSDisabledFrontend();
    const isOtpCodeDisabledValue = checkIsFlagOtpCodeDisabledFrontend();
    setIsEmailDisabled(isEmailDisabledValue);
    setIsSMSDisabled(isSMSDisabledValue);
    setIsOtpCodeDisabled(isOtpCodeDisabledValue);
  }, []);

  const onToggleEmail = () => {
    if (!isShowDevelopmentHelpers()) {
      return;
    }

    const isEmailDisabledValue = checkIsFlagEmailDisabledFrontend();
    if (isEmailDisabledValue) {
      JSCookies.remove(cookiesKey.email);
      setIsEmailDisabled(false);
    } else {
      setFlagEmail();
      setIsEmailDisabled(true);
    }
  };

  const onToggleSMS = () => {
    if (!isShowDevelopmentHelpers()) {
      return;
    }

    const isSMSDisabledValue = checkIsFlagSMSDisabledFrontend();
    if (isSMSDisabledValue) {
      JSCookies.remove(cookiesKey.sms);
      setIsSMSDisabled(false);
    } else {
      setFlagSMS();
      setIsSMSDisabled(true);
    }
  };

  const onToggleOtpCode = () => {
    if (!isShowDevelopmentHelpers()) {
      return;
    }

    const isOtpCodeDisabledValue = checkIsFlagOtpCodeDisabledFrontend();
    if (isOtpCodeDisabledValue) {
      JSCookies.remove(cookiesKey.otpCode);
      setIsOtpCodeDisabled(false);
    } else {
      setFlagOtpCode();
      setIsOtpCodeDisabled(true);
    }
  };

  const contextValues = useMemo(() => {
    return {
      isEmailDisabled,
      isOtpCodeDisabled,
      isSMSDisabled,
      onToggleEmail,
      onToggleOtpCode,
      onToggleSMS,
    };
  }, [
    isEmailDisabled,
    isOtpCodeDisabled,
    isSMSDisabled,
    onToggleEmail,
    onToggleOtpCode,
    onToggleSMS,
  ]);

  return (
    <CookiesContext.Provider value={contextValues}>
      {children}
    </CookiesContext.Provider>
  );
};

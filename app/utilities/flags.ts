import dayjs from "dayjs";
import JSCookies from "js-cookie";

import { cookiesKey, cookiesValue } from "~/constants/cookies";

export const isShowDevelopmentHelpers = () => {
  return import.meta.env.VITE_SHOW_DEVELOPMENT_HELPERS === "true";
};

export const isEnableCreateOrLoginCompany = () => {
  return import.meta.env.VITE_CREATE_OR_LOGIN_COMPANY === "true";
};

export const checkIsFlagEmailDisabledFrontend = (): boolean => {
  const emailCodeFromCookie = JSCookies.get(cookiesKey.email);

  if (!isShowDevelopmentHelpers()) {
    return false;
  }

  return emailCodeFromCookie === cookiesValue.email;
};

export const setFlagEmail = () => {
  const isLocalhost = globalThis.location.hostname === "localhost";

  JSCookies.set(cookiesKey.email, cookiesValue.email, {
    expires: dayjs().add(1, "year").toDate(),
    path: "/",
    sameSite: "Lax",
    secure: !isLocalhost,
  });
};

export const checkIsFlagSMSDisabledFrontend = (): boolean => {
  const smsFromCookie = JSCookies.get(cookiesKey.sms);

  if (!isShowDevelopmentHelpers()) {
    return false;
  }

  return smsFromCookie === cookiesValue.sms;
};

export const setFlagSMS = () => {
  const isLocalhost = globalThis.location.hostname === "localhost";

  JSCookies.set(cookiesKey.sms, cookiesValue.sms, {
    expires: dayjs().add(1, "year").toDate(),
    path: "/",
    sameSite: "Lax",
    secure: !isLocalhost,
  });
};

export const checkIsFlagOtpCodeDisabledFrontend = (): boolean => {
  const emailCodeFromCookie = JSCookies.get(cookiesKey.otpCode);

  if (!isShowDevelopmentHelpers()) {
    return false;
  }

  return emailCodeFromCookie === cookiesValue.otpCode;
};

export const setFlagOtpCode = () => {
  const isLocalhost = globalThis.location.hostname === "localhost";

  JSCookies.set(cookiesKey.otpCode, cookiesValue.otpCode, {
    expires: dayjs().add(1, "year").toDate(),
    path: "/",
    sameSite: "Lax",
    secure: !isLocalhost,
  });
};

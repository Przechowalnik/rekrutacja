import { cookiesKey, cookiesValue } from "~/constants/cookies";

export { isE2E } from "./isE2E.server";

export const isShowDevelopmentHelpersServer = () => {
  return import.meta.env.VITE_SHOW_DEVELOPMENT_HELPERS === "true";
};

export const isEnableCreateOrLoginCompanyServer = () => {
  return import.meta.env.VITE_CREATE_OR_LOGIN_COMPANY === "true";
};

function getCookieValue(
  cookieHeader: null | string,
  cookieName: string,
): null | string {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === cookieName && value) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export const checkIsFlagOtpCodeDisabledBackend = (
  request: Request,
): boolean => {
  const cookieHeader = request.headers.get("Cookie");
  const otpCodeCookie = getCookieValue(cookieHeader, cookiesKey.otpCode);

  if (otpCodeCookie && isShowDevelopmentHelpersServer()) {
    return otpCodeCookie === cookiesValue.otpCode;
  }
  return false;
};

export const checkIsFlagEmailDisabledBackend = (request: Request): boolean => {
  const cookieHeader = request.headers.get("Cookie");
  const emailCookie = getCookieValue(cookieHeader, cookiesKey.email);

  if (emailCookie && isShowDevelopmentHelpersServer()) {
    return emailCookie === cookiesValue.email;
  }
  return false;
};

export const checkIsFlagSMSDisabledBackend = (request: Request): boolean => {
  const cookieHeader = request.headers.get("Cookie");
  const smsCookie = getCookieValue(cookieHeader, cookiesKey.sms);

  if (smsCookie && isShowDevelopmentHelpersServer()) {
    return smsCookie === cookiesValue.sms;
  }
  return false;
};

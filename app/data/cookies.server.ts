import * as cookiePackage from "cookie";

export const cookie = {
  expiresAt: "expiresAt",
  forceFetchUserData: "forceFetchUserData",
  userCompanyId: "userCompanyId",
  userCompanyName: "userCompanyName",
  userFirstName: "userFirstName",
  userId: "userId",
  userLang: "userLang",
  userLastName: "userLastName",
  userRole: "userRole",
  userSessionVersion: "userSessionVersion",
};

export function getCookieValue(
  cookieHeader: null | string,
  cookieName: string,
): null | string {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookiePackage.parse(cookieHeader);
  return cookies[cookieName] || null;
}

export function getLastIdCookieName(request: Request): string {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\//, "").replaceAll("/", "_") || "home";
  return `lastId_${path}`;
}

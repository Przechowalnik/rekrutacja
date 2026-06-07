import dayjs from "dayjs";
import { createCookieSessionStorage, data, redirect } from "react-router";

import type { T_RouteName } from "~/constants/routes";
import { E_Routes, getRoute } from "~/constants/routes";
import type { T_Language } from "~/models/enums";
import { T_FlashData } from "~/models/flashData";
import { T_UserCookie } from "~/models/userCookie";

import { cookie } from "./cookies.server";
import { environment } from "./environment.server";
import { setFlashMessage } from "./flashMessage.server";
import { getLocalizedRedirectPath } from "./functions.server";
import { isE2E } from "./isE2E.server";
import type { T_UserRolesServer } from "./models.server";
import { E_RolesServer } from "./models.server";

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

const sessionStorageRemix = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    name: "__session",
    path: "/",
    sameSite: "lax",
    secrets: [isE2E ? "test-secret-for-e2e" : environment("SESSION_SECRET")],
    secure: process.env.NODE_ENV === "production",
  },
});

export type T_GenerateUserCookiesSession = {
  userCompanyId: null | string;
  userCompanyName: null | string;
  userEmailVerification: {
    verifiedAt: Date | null;
  } | null;
  userFirstName: string;
  userId: string;
  userLang: T_Language;
  userLastName: null | string;
  userPhoneVerification: {
    countryCodeToConfirm: null | number;
    numberToConfirm: bigint | null | number;
    verifiedAt: Date | null;
  } | null;
  userRole: T_UserRolesServer;
  userSessionVersion: number;
};

export const generateUserCookiesSession = async ({
  userCompanyId,
  userCompanyName,
  userEmailVerification,
  userFirstName,
  userId,
  userLang,
  userLastName,
  userPhoneVerification,
  userRole,
  userSessionVersion,
}: T_GenerateUserCookiesSession) => {
  const session = await sessionStorageRemix.getSession();
  session.set(cookie.userId, userId);
  session.set(cookie.userRole, userRole);
  session.set(cookie.userFirstName, userFirstName);
  if (userLastName) {
    session.set(cookie.userLastName, userLastName);
  } else {
    session.unset(cookie.userLastName);
  }
  session.set(cookie.userSessionVersion, userSessionVersion);
  session.set(cookie.userLang, userLang);
  session.set(
    cookie.expiresAt,
    dayjs().add(SESSION_TTL_SECONDS, "second").toDate(),
  );

  if (!userEmailVerification?.verifiedAt) {
    session.set(cookie.forceFetchUserData, true);
  }

  if (userPhoneVerification ? !userPhoneVerification?.verifiedAt : false) {
    session.set(cookie.forceFetchUserData, true);
  }

  if (userCompanyId) {
    session.set(cookie.userCompanyId, userCompanyId);
  }
  if (userCompanyName && userCompanyId) {
    session.set(cookie.userCompanyName, userCompanyName);
  }

  return await sessionStorageRemix.commitSession(session);
};

export const createUserSession = async ({
  flashData,
  redirectPath,
  request,
  ...restProps
}: T_GenerateUserCookiesSession & {
  flashData?: T_FlashData;
  redirectPath: string;
  request?: Request;
}) => {
  const sessionCookie = await generateUserCookiesSession({ ...restProps });
  const finalRedirectPath = request
    ? getLocalizedRedirectPath(redirectPath, request)
    : redirectPath;

  if (request && flashData) {
    const flashCookie = await setFlashMessage(request, flashData);

    const headers = new Headers();
    headers.append("Set-Cookie", sessionCookie);
    headers.append("Set-Cookie", flashCookie);

    return redirect(finalRedirectPath, {
      headers,
    });
  }

  return redirect(finalRedirectPath, {
    headers: {
      "Set-Cookie": sessionCookie,
    },
  });
};

type T_GetUserFromSession = {
  request: Request;
  roles?: T_UserRolesServer[];
};

export const getUserFromSession = async ({
  request,
  roles = [
    E_RolesServer.USER,
    E_RolesServer.ADMIN,
    E_RolesServer.ADMIN_SUPER,
    E_RolesServer.B2B_OWNER,
    E_RolesServer.B2B_WORKER,
  ],
}: T_GetUserFromSession): Promise<T_UserCookie> => {
  const session = await sessionStorageRemix.getSession(
    request.headers.get("Cookie"),
  );

  const userId = session.get(cookie.userId) ?? null;
  const userRole = session.get(cookie.userRole) ?? null;
  const userLang = session.get(cookie.userLang) ?? null;
  const userCompanyId = session.get(cookie.userCompanyId) ?? null;
  const userFirstName = session.get(cookie.userFirstName) ?? null;
  const userLastName = session.get(cookie.userLastName) ?? null;
  const userCompanyName = session.get(cookie.userCompanyName) ?? null;
  const userSessionVersion = session.get(cookie.userSessionVersion) ?? null;
  const forceFetchUserData = session.get(cookie.forceFetchUserData) ?? null;
  const expiresAt = session.get(cookie.expiresAt) ?? null;

  if (typeof userId !== "string" || typeof userRole !== "string") {
    return {
      expiresAt: null,
      forceFetchUserData: null,
      userCompanyId: null,
      userCompanyName: null,
      userFirstName: null,
      userId: null,
      userLang: null,
      userLastName: null,
      userRole: null,
      userSessionVersion: null,
    };
  }

  if (!userId || !userRole) {
    return {
      expiresAt: null,
      forceFetchUserData: null,
      userCompanyId: null,
      userCompanyName: null,
      userFirstName: null,
      userId: null,
      userLang: null,
      userLastName: null,
      userRole: null,
      userSessionVersion: null,
    };
  }

  const isUserRoleInRoles = roles.includes(userRole as T_UserRolesServer);

  if (!isUserRoleInRoles) {
    return {
      expiresAt: null,
      forceFetchUserData: null,
      userCompanyId: null,
      userCompanyName: null,
      userFirstName: null,
      userId: null,
      userLang: null,
      userLastName: null,
      userRole: null,
      userSessionVersion: null,
    };
  }

  return {
    expiresAt,
    forceFetchUserData: forceFetchUserData?.toString() === "true",
    userCompanyId,
    userCompanyName,
    userFirstName,
    userId,
    userLang,
    userLastName,
    userRole: userRole as T_UserRolesServer,
    userSessionVersion,
  };
};

type T_DestroyUserSession = {
  forceStatusError?: boolean;
  isError?: boolean;
  message?: string;
  request: Request;
  route?: E_Routes | T_RouteName;
  status?: number;
  withLogout?: boolean;
  withRedirect: boolean;
};

export const destroyUserSession = async ({
  forceStatusError,
  isError,
  message = "userLogout",
  request,
  route = E_Routes.login,
  status,
  withLogout,
  withRedirect = true,
}: T_DestroyUserSession) => {
  const session = await sessionStorageRemix.getSession(
    request.headers.get("Cookie"),
  );

  const destroySessionCookie =
    await sessionStorageRemix.destroySession(session);

  const headers = new Headers();
  headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  headers.set("Expires", "0");
  headers.set("Pragma", "no-cache");
  headers.set("Surrogate-Control", "no-store");
  headers.append("Set-Cookie", destroySessionCookie);

  const flashCookie = await setFlashMessage(request, {
    message: isError ? "somethingWentWrong" : message,
    messageStatus: isError || forceStatusError ? "error" : "success",
    ...(withLogout ? { logout: true } : {}),
  });
  headers.append("Set-Cookie", flashCookie);

  if (withRedirect) {
    const targetPath = getRoute({
      route,
    });
    return redirect(getLocalizedRedirectPath(targetPath, request), {
      headers,
    });
  }

  return data(
    {},
    {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      status: status ?? (isError ? 404 : 401),
    },
  );
};

import { createCookieSessionStorage } from "react-router";

import { T_FlashData } from "~/models/flashData";

import { getUserFromSession } from "./authSession.server";
import { environment } from "./environment.server";
import { isE2E } from "./isE2E.server";

const FLASH_SESSION_KEY = "__flash";

const flashSessionStorage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    maxAge: 60,
    name: "__flash",
    path: "/",
    sameSite: "lax",
    secrets: [isE2E ? "test-secret-for-e2e" : environment("SESSION_SECRET")],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getFlashSession(request: Request) {
  return flashSessionStorage.getSession(request.headers.get("Cookie"));
}

export async function commitFlashSession(
  session: Awaited<ReturnType<typeof getFlashSession>>,
) {
  return flashSessionStorage.commitSession(session);
}

export async function setFlashMessage(
  request: Request,
  data: T_FlashData,
): Promise<string> {
  const session = await getFlashSession(request);
  session.flash(FLASH_SESSION_KEY, data);
  return commitFlashSession(session);
}

export async function getFlashMessageWithUserCookie(request: Request) {
  const {
    expiresAt,
    forceFetchUserData,
    userCompanyId,
    userCompanyName,
    userFirstName,
    userId,
    userLang,
    userLastName,
    userRole,
    userSessionVersion,
  } = await getUserFromSession({
    request,
  });
  const session = await getFlashSession(request);
  const data = session.get(FLASH_SESSION_KEY) as T_FlashData | undefined;
  const destroyCookie = await flashSessionStorage.destroySession(session);

  const userCookieData = {
    expiresAt,
    forceFetchUserData,
    userCompanyId,
    userCompanyName,
    userFirstName,
    userId,
    userLang,
    userLastName,
    userRole,
    userSessionVersion,
  };

  return {
    data: {
      flashData: data ?? null,
      userCookie: Object.values(userCookieData).some(Boolean)
        ? userCookieData
        : null,
    },
    headers: {
      "Set-Cookie": destroyCookie,
    },
  };
}

export function createFlashHeaders(flashCookie: string): HeadersInit {
  return {
    "Set-Cookie": flashCookie,
  };
}

export async function createRedirectWithFlash(
  url: string,
  request: Request,
  flashData: T_FlashData,
  existingHeaders?: HeadersInit,
) {
  const flashCookie = await setFlashMessage(request, flashData);

  const headers = new Headers(existingHeaders);
  headers.append("Set-Cookie", flashCookie);

  return { headers, url };
}

import { z } from "zod";

import { E_Routes, getRoute } from "~/constants/routes";
import { sessionStorageKeys } from "~/constants/sessionStorage";
import { expiryCache } from "~/lib/cache";
import { T_UserCookie, Z_UserCookie } from "~/models/userCookie";
import { T_UserSession, Z_UserSession } from "~/models/userSession";

import { axiosClient } from "./axiosClient";

export const fetchUserSession = async ({
  forceNoCache,
}: {
  forceNoCache?: boolean;
}): Promise<{
  data: {
    userCookie?: null | T_UserCookie;
    userSession: null | T_UserSession;
  } | null;
  fromCache: boolean;
  isError: boolean;
}> => {
  const cacheSession = expiryCache({
    key: sessionStorageKeys.userSession,
    schema: Z_UserSession,
    storage: sessionStorage,
  });

  try {
    if (!forceNoCache) {
      const cachedSession = cacheSession.get();

      if (cachedSession) {
        return {
          data: {
            userSession: cachedSession,
          },
          fromCache: true,
          isError: false,
        };
      }
    }

    const response = await axiosClient.get(
      getRoute({ route: E_Routes.apiAccountSession }),
      {
        headers: { "Cache-Control": "no-store" },
        withCredentials: true,
      },
    );

    const apiResult = z
      .object({
        userCookie: Z_UserCookie,
        userSession: Z_UserSession,
      })
      .safeParse(response?.data);

    if (!apiResult.success) {
      cacheSession.clear();
      return { data: null, fromCache: false, isError: true };
    }

    cacheSession.set({
      data: apiResult.data.userSession,
      expiresInMs: 3000, // 3s
    });

    return {
      data: apiResult.data,
      fromCache: false,
      isError: false,
    };
  } catch {
    cacheSession.clear();

    return {
      data: null,
      fromCache: false,
      isError: true,
    };
  }
};

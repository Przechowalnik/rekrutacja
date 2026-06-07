import { z } from "zod";

import { E_Routes, getRoute } from "~/constants/routes";
import { sessionStorageKeys } from "~/constants/sessionStorage";
import { expiryCache } from "~/lib/cache";
import { T_FlashData, Z_FlashData } from "~/models/flashData";
import { T_UserCookie, Z_UserCookie } from "~/models/userCookie";

import { axiosClient } from "./axiosClient";

export const fetchUserCookieWithFlashData = async ({
  forceNoCache,
}: {
  forceNoCache?: boolean;
} = {}): Promise<{
  data: {
    flashData: null | T_FlashData;
    userCookie: null | T_UserCookie;
  } | null;
  fromCache: boolean;
}> => {
  const cacheCookie = expiryCache({
    key: sessionStorageKeys.userCookie,
    schema: z.object({
      flashData: Z_FlashData.nullable().optional(),
      userCookie: Z_UserCookie.nullable().optional(),
    }),
    storage: sessionStorage,
  });

  try {
    if (!forceNoCache) {
      const cachedCookie = cacheCookie.get();

      if (cachedCookie) {
        return {
          data: {
            flashData: cachedCookie?.flashData ?? null,
            userCookie: cachedCookie?.userCookie ?? null,
          },
          fromCache: true,
        };
      }
    }

    const response = await axiosClient.get(
      getRoute({ route: E_Routes.apiAccountCookie }),
      {
        headers: { "Cache-Control": "no-store" },
        withCredentials: true,
      },
    );

    const apiResult = z
      .object({
        flashData: Z_FlashData.nullable().optional(),
        userCookie: Z_UserCookie.nullable().optional(),
      })
      .safeParse(response?.data);

    if (!apiResult.success) {
      cacheCookie.clear();
      return { data: null, fromCache: false };
    }

    if (apiResult.data.userCookie) {
      cacheCookie.set({
        data: apiResult.data,
        expiresInMs: 200, // 0.2s
      });
    } else {
      cacheCookie.clear();
    }

    return {
      data: {
        flashData: apiResult?.data?.flashData ?? null,
        userCookie: apiResult?.data?.userCookie ?? null,
      },
      fromCache: false,
    };
  } catch {
    cacheCookie.clear();

    return {
      data: null,
      fromCache: false,
    };
  }
};

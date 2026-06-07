import type { T_PlatformSetting } from "~/models/platformSetting";

import { database } from "./database.server";
import { prismaSelectPlatformSetting } from "./prismaSelect.server";
import type { T_ResponseOnFailure } from "./response.server";
import { responseGetOnFailure, responseOnSuccess } from "./response.server";

type T_GetPlatformSettingsToReturnResult = {
  platformSetting?: null | (T_PlatformSetting & { id?: string });
  responseError?: T_ResponseOnFailure;
};

export const getPlatformSettingsToReturn = async ({
  request,
  respectPlatformSettings = true,
}: {
  request: Request;
  respectPlatformSettings?: boolean;
}): Promise<T_GetPlatformSettingsToReturnResult> => {
  try {
    const foundSetting = await database.platformSetting.findFirst({
      select: { ...prismaSelectPlatformSetting, id: true },
    });

    if (!foundSetting && respectPlatformSettings) {
      console.error("No detected platform settings");
      return {
        responseError: {
          message: "somethingWentWrong",
          request,
          status: 422,
        },
      };
    }

    return {
      platformSetting: foundSetting,
    };
  } catch {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 422,
      },
    };
  }
};

export const getPlatformSettings = async ({
  request,
}: {
  request: Request;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const platformSettingResult = await getPlatformSettingsToReturn({
      request,
    });

    if (platformSettingResult.responseError) {
      return redirectOnError;
    }

    if (!platformSettingResult.platformSetting?.id) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      data: {
        platformSetting: platformSettingResult.platformSetting,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

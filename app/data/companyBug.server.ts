import { database } from "~/data/database.server";

import { getPlatformSettingsToReturn } from "./platformSettings.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectBug } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnSuccess,
} from "./response.server";

export const getBugCompany = async ({
  bugId,
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  bugId: string | undefined;
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    if (!bugId || !userCompanyId) {
      return redirectOnError;
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: true,
      prismaArguments: {
        select: {},
        where: {
          companyId: userCompanyId,
          id: userId,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      if (responseError.status === 401) {
        return await responseGetOnFailureLogout({
          request,
        });
      }

      return redirectOnError;
    }

    if (!existingUser) {
      return redirectOnError;
    }

    const foundBug = await database.bug.findUnique({
      select: prismaSelectBug,
      where: {
        companyId: userCompanyId,
        id: bugId,
      },
    });

    if (!foundBug) {
      return redirectOnError;
    }

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
        bug: foundBug,
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

export const getBugsCompany = async ({
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  if (!userCompanyId) {
    return redirectOnError;
  }

  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: true,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      if (responseError.status === 401) {
        return await responseGetOnFailureLogout({
          request,
        });
      }

      return redirectOnError;
    }

    if (!existingUser) {
      return redirectOnError;
    }

    const bugs = await database.bug.findMany({
      select: prismaSelectBug,
      where: {
        companyId: userCompanyId,
      },
    });

    return await responseOnSuccess({
      data: {
        bugs,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

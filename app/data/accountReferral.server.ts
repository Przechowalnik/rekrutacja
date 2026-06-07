import { database } from "./database.server";
import { generateUniqueReferralCode } from "./functions.server";
import { E_RolesServer } from "./models.server";
import { getPlatformSettingsToReturn } from "./platformSettings.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectReferral } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";

export const getAccountReferralPlatformSettings = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });
  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.USER],
          },
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

    if (!existingUser?.id) {
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

    const foundReferral = await database.referral.findFirst({
      select: prismaSelectReferral,
      where: {
        userId,
      },
    });

    return await responseOnSuccess({
      data: {
        platformSetting: platformSettingResult.platformSetting,
        referral: foundReferral,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const createAccountReferral = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      prismaArguments: {
        select: {
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
          referral: {
            select: {
              code: true,
            },
          },
        },
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.USER],
          },
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser?.id) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    if (existingUser.referral?.code) {
      return await responseOnFailure({
        message: "accountHasReferral",
        request,
        status: 422,
      });
    }

    const uniqueReferralCode = await generateUniqueReferralCode();

    if (!uniqueReferralCode) {
      throw responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    await database.referral.create({
      data: {
        code: uniqueReferralCode,
        countCompanies: 0,
        countUsers: 0,
        userId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successCreateReferral",
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

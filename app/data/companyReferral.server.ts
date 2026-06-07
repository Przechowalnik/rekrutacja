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

export const getCompanyReferralPlatformSettings = async ({
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
          role: {
            in: [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
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

    if (!existingUser?.company?.id) {
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

    const foundCompanyReferral = await database.referral.findFirst({
      select: prismaSelectReferral,
      where: {
        companyId: userCompanyId,
      },
    });

    return await responseOnSuccess({
      data: {
        platformSetting: platformSettingResult.platformSetting,
        referral: foundCompanyReferral,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const createCompanyReferral = async ({
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
      company: true,
      prismaArguments: {
        select: {
          company: {
            select: {
              referral: {
                select: {
                  code: true,
                },
              },
            },
          },
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
        },
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.B2B_OWNER],
          },
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser?.company?.id) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    if (existingUser.company.referral?.code) {
      return await responseOnFailure({
        message: "companyHasReferral",
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
        companyId: existingUser.company.id,
        countCompanies: 0,
        countUsers: 0,
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

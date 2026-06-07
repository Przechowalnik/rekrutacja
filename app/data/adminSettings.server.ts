import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";
import type { T_Plan } from "~/models/plan";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { E_RolesServer } from "./models.server";
import { getPlatformSettingsToReturn } from "./platformSettings.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectPlan } from "./prismaSelect.server";
import { getPlans } from "./publicPlans.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getSettingsAdmin = async ({
  request,
  requiredSettings = false,
  userId,
  userSessionVersion,
  withPlans = false,
}: {
  request: Request;
  requiredSettings?: boolean;
  userId: string;
  userSessionVersion: null | number;
  withPlans?: boolean;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
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

    const platformSettingResult = await getPlatformSettingsToReturn({
      request,
    });

    if (requiredSettings && platformSettingResult.responseError) {
      return redirectOnError;
    }

    if (requiredSettings && !platformSettingResult.platformSetting) {
      return redirectOnError;
    }

    let foundPlans: T_Plan[] = [];

    if (withPlans) {
      foundPlans = await database.plan.findMany({
        orderBy: {
          price: "asc",
        },
        select: prismaSelectPlan,
        where: {
          isDeletedAt: null,
          NOT: {
            enabledAt: null,
          },
        },
      });
    }

    return await responseOnSuccess({
      data: {
        ...(withPlans
          ? {
              plans: foundPlans,
            }
          : {}),
        platformSetting: platformSettingResult.platformSetting ?? null,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const checkSettingsNoExistAndGetPlans = async ({
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
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
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

    const platformSettingResult = await getPlatformSettingsToReturn({
      request,
      respectPlatformSettings: false,
    });

    if (platformSettingResult.responseError) {
      return redirectOnError;
    }

    if (platformSettingResult.platformSetting) {
      return redirectOnError;
    }

    return await getPlans({
      request,
      withTrial: true,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const createNewPlatformSettingsAdmin = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.freeTrialCompanyMonthsCount]:
          zodValidator.freeTrialCompanyMonthsCount,
        [formNames.freeTrialMaxListings]: zodValidator.freeTrialMaxListings,
        [formNames.planId]: zodValidator.planId,
        [formNames.pointsBigBug]: zodValidator.pointsBigBug,
        [formNames.pointsMediumBug]: zodValidator.pointsMediumBug,
        [formNames.pointsReferralCompany]: zodValidator.pointsReferralCompany,
        [formNames.pointsReferralUser]: zodValidator.pointsReferralUser,
        [formNames.pointsSmallBug]: zodValidator.pointsSmallBug,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: true,
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: resultValidator.data[formNames.authenticator],
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    const {
      freeTrialCompanyMonthsCount,
      freeTrialMaxListings,
      planId,
      pointsBigBug,
      pointsMediumBug,
      pointsReferralCompany,
      pointsReferralUser,
      pointsSmallBug,
    } = resultValidator.data;

    const foundPlatformSettings = await database.platformSetting.count({});

    if (foundPlatformSettings > 0) {
      console.error("Detected platform settings");
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    await database.platformSetting.create({
      data: {
        freeTrialCompanyMonthsCount,
        freeTrialMaxListings,
        planIdFreeTrialCompany: planId,
        pointsBigBug,
        pointsMediumBug,
        pointsReferralCompany,
        pointsReferralUser,
        pointsSmallBug,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successCreatePlatformSettings",
      },
      redirectTo: E_Routes.adminSettings,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const updatePlatformSettingsAdmin = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.freeTrialCompanyMonthsCount]:
          zodValidator.freeTrialCompanyMonthsCount,
        [formNames.freeTrialMaxListings]: zodValidator.freeTrialMaxListings,
        [formNames.planId]: zodValidator.planId,
        [formNames.pointsBigBug]: zodValidator.pointsBigBug,
        [formNames.pointsMediumBug]: zodValidator.pointsMediumBug,
        [formNames.pointsReferralCompany]: zodValidator.pointsReferralCompany,
        [formNames.pointsReferralUser]: zodValidator.pointsReferralUser,
        [formNames.pointsSmallBug]: zodValidator.pointsSmallBug,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: true,
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: resultValidator.data[formNames.authenticator],
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    const {
      freeTrialCompanyMonthsCount,
      freeTrialMaxListings,
      planId,
      pointsBigBug,
      pointsMediumBug,
      pointsReferralCompany,
      pointsReferralUser,
      pointsSmallBug,
    } = resultValidator.data;

    const platformSettingResult = await getPlatformSettingsToReturn({
      request,
    });

    if (platformSettingResult.responseError) {
      return await responseOnFailure(platformSettingResult.responseError);
    }

    if (!platformSettingResult.platformSetting?.id) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    await database.platformSetting.update({
      data: {
        freeTrialCompanyMonthsCount,
        freeTrialMaxListings,
        planIdFreeTrialCompany: planId,
        pointsBigBug,
        pointsMediumBug,
        pointsReferralCompany,
        pointsReferralUser,
        pointsSmallBug,
      },
      where: {
        id: platformSettingResult?.platformSetting?.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdatePlatformSettings",
      },
      redirectTo: E_Routes.admin,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

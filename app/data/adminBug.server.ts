import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { getCookieValue, getLastIdCookieName } from "./cookies.server";
import { manageFilesInStorage } from "./images.server";
import {
  E_BugPriorityServer,
  E_BugStatusServer,
  E_RolesServer,
} from "./models.server";
import { getPlatformSettingsToReturn } from "./platformSettings.server";
import { addPoints } from "./points.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectBug } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getBugAdmin = async ({
  bugId,
  request,
  userId,
  userSessionVersion,
}: {
  bugId: string | undefined;
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    if (!bugId) {
      return redirectOnError;
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
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

    if (!existingUser) {
      return redirectOnError;
    }

    const foundBug = await database.bug.findUnique({
      select: prismaSelectBug,
      where: {
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

    if (!platformSettingResult.platformSetting) {
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

export const getBugsAdmin = async ({
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
    const resultValidator = await checkZodValidator({
      queryData: [formNames.limit, formNames.page, formNames.bugShowClosed],
      request,
      validator: {
        [formNames.bugShowClosed]: zodValidator.checkboxQuery.optional(),
        [formNames.limit]: zodValidator.limit.optional(),
        [formNames.page]: zodValidator.page.optional(),
      },
    });

    if (resultValidator?.responseError) {
      return redirectOnError;
    }

    if (!resultValidator?.data) {
      return redirectOnError;
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
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

    if (!existingUser) {
      return redirectOnError;
    }

    const { bugShowClosed, limit = 10, page = 1 } = resultValidator.data;

    const lastId = getCookieValue(
      request.headers.get("cookie"),
      getLastIdCookieName(request),
    );
    const skip = (page - 1) * limit;

    const searchBug = {
      status: {
        in: bugShowClosed
          ? [
              E_BugStatusServer.DUPLICATE,
              E_BugStatusServer.REJECTED,
              E_BugStatusServer.RESOLVED,
            ]
          : [E_BugStatusServer.IN_PROGRESS, E_BugStatusServer.REPORTED],
      },
    };

    let cursorId: null | string = null;

    if (lastId) {
      const exists = await database.bug.findFirst({
        select: { id: true },
        where: { id: lastId, ...searchBug },
      });

      cursorId = exists ? lastId : null;
    }

    const bugs = await database.bug.findMany({
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : { skip }),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: prismaSelectBug,
      take: limit,
      where: searchBug,
    });

    const total = await database.blogPost.count({
      where: {},
    });

    const nextPage = skip + limit < total ? page + 1 : null;
    const totalPages = Math.ceil(total / limit);

    return await responseOnSuccess({
      data: {
        bugs,
        nextPage,
        totalPages,
        totalResults: total,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const bugPointsPay = async ({
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
        [formNames.bugId]: zodValidator.bugId,
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
      prismaArguments: {
        select: {
          role: true,
        },
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
          },
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

    const { authenticator, bugId } = resultValidator.data;

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: authenticator,
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    const platformSettingResult = await getPlatformSettingsToReturn({
      request,
    });

    if (platformSettingResult.responseError) {
      return await responseOnFailure(platformSettingResult.responseError);
    }

    if (!platformSettingResult.platformSetting) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const updatedBug = await database.bug.update({
      data: {
        pointsPaidAt: dayjs().toDate(),
      },
      select: {
        companyId: true,
        priority: true,
        userId: true,
      },
      where: {
        id: bugId,
        NOT: {
          companyId: null,
          pointsPaidAt: null,
        },
      },
    });

    let pointsToPay = null;
    if (updatedBug.priority && updatedBug.companyId) {
      switch (updatedBug.priority) {
        case E_BugPriorityServer.BIG: {
          pointsToPay = platformSettingResult.platformSetting.pointsBigBug;

          break;
        }
        case E_BugPriorityServer.MEDIUM: {
          pointsToPay = platformSettingResult.platformSetting.pointsMediumBug;

          break;
        }
        case E_BugPriorityServer.SMALL: {
          pointsToPay = platformSettingResult.platformSetting.pointsSmallBug;

          break;
        }
      }
    }

    if (!updatedBug.companyId && !updatedBug.userId) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    if (updatedBug.companyId && updatedBug.userId) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    if (pointsToPay && updatedBug.companyId) {
      const resultAddPoints = await addPoints({
        companyIdAddPoints: updatedBug.companyId ?? null,
        pointsToAdd: pointsToPay,
        request,
        userIdAddPoints: updatedBug.userId ?? null,
      });

      if (resultAddPoints?.responseError) {
        return await responseOnFailure(resultAddPoints?.responseError);
      }
    }

    return await responseOnSuccess({
      flashData: {
        message: "successBugPointsPaid",
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const updateBugAdmin = async ({
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
        [formNames.bugAnswer]: zodValidator.bugAnswer.optional(),
        [formNames.bugId]: zodValidator.bugId,
        [formNames.bugPriority]: zodValidator.bugPriority,
        [formNames.bugStatus]: zodValidator.bugStatus,
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
      prismaArguments: {
        select: {
          role: true,
        },
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
          },
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

    const { authenticator, bugAnswer, bugId, bugPriority, bugStatus } =
      resultValidator.data;

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: authenticator,
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    if (bugStatus === E_BugStatusServer.RESOLVED) {
      const foundBug = await database.bug.findUnique({
        select: {
          video: true,
        },
        where: {
          id: bugId,
        },
      });

      if (foundBug?.video) {
        await manageFilesInStorage({
          delete: [foundBug.video],
          folder: "bugs",
          type: "videos",
        });
      }

      await database.bug.update({
        data: {
          answer: bugAnswer ?? null,
          priority: bugPriority,
          status: bugStatus,
          video: null,
        },
        where: {
          id: bugId,
        },
      });
    } else {
      await database.bug.update({
        data: {
          answer: bugAnswer ?? null,
          priority: bugPriority,
          status: bugStatus,
        },
        where: {
          id: bugId,
        },
      });
    }

    return await responseOnSuccess({
      flashData: {
        message: "successBugUpdate",
      },
      redirectTo: E_Routes.adminBugs,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

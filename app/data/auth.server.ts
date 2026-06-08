import type { Params } from "react-router";

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { environment } from "~/data/environment.server";
import type { T_CompanyWorkerRoles } from "~/models/enums";

import { getUserFromSession } from "./authSession.server";
import {
  isEnableCreateOrLoginCompanyServer,
  isShowDevelopmentHelpersServer,
} from "./flags.server";
import type {
  T_CompanyWorkerPermissionsServer,
  T_UserRolesServer,
} from "./models.server";
import { E_RolesServer } from "./models.server";
import { responseGetOnFailure } from "./response.server";
import { applyRateLimit } from "./security.server";

type T_CheckIsUserHasPermissions = {
  companyId: string;
  permissions: T_CompanyWorkerPermissionsServer[];
  roles?: T_UserRolesServer[];
  userId: null | string;
};

export const checkIsUserHasPermissions = async ({
  companyId,
  permissions,
  roles,
  userId,
}: T_CheckIsUserHasPermissions) => {
  if (!userId) {
    return false;
  }

  const countFoundWorker = await database.user.count({
    where:
      permissions.length > 0
        ? {
            blockedAt: null,
            companyId,
            id: userId,
            OR: [
              {
                role: E_RolesServer.B2B_OWNER,
              },
              {
                role: {
                  in: roles,
                },
                workerSettings: {
                  companyId,
                  permissions: {
                    hasSome: permissions,
                  },
                },
              },
            ],
          }
        : {
            blockedAt: null,
            companyId,
            id: userId,
            role: {
              in: roles,
            },
          },
  });

  if (countFoundWorker === 0) {
    return false;
  }

  return true;
};

type T_CheckIsCompanyHaveUserIdInWorkers = {
  companyId: string;
  workerId: string;
  workerPermissions: T_CompanyWorkerPermissionsServer[];
  workerRoles: T_CompanyWorkerRoles[];
};

type T_CheckIsCompanyHaveUserIdInWorkersResult = {
  isValid: boolean;
  workerSettingsId: null | string;
};

export const checkIsCompanyHaveUserIdInWorkers = async ({
  companyId,
  workerId,
  workerPermissions,
  workerRoles,
}: T_CheckIsCompanyHaveUserIdInWorkers): Promise<T_CheckIsCompanyHaveUserIdInWorkersResult> => {
  if (!companyId || !workerId) {
    return {
      isValid: false,
      workerSettingsId: null,
    };
  }

  const foundWorker = await database.user.findUnique({
    select: {
      id: true,
      workerSettings: {
        select: {
          id: true,
        },
      },
    },
    where:
      workerPermissions.length > 0
        ? {
            blockedAt: null,
            companyId,
            id: workerId,
            OR: [
              {
                role: E_RolesServer.B2B_OWNER,
              },
              {
                role: {
                  in: workerRoles,
                },
                workerSettings: {
                  companyId,
                  permissions: {
                    hasSome: workerPermissions,
                  },
                },
              },
            ],
          }
        : {
            blockedAt: null,
            companyId,
            id: workerId,
            role: {
              in: workerRoles,
            },
          },
  });

  if (!foundWorker) {
    return {
      isValid: false,
      workerSettingsId: null,
    };
  }

  return {
    isValid: true,
    workerSettingsId: foundWorker?.workerSettings?.id ?? null,
  };
};

type T_RequireUserSession = {
  params?: Params<string>;
  redirectPath?: E_Routes;
  request: Request;
  respectCompany?: boolean;
  respectCompanyWorkerId?: boolean;
  skipsPermissionsIfUserIsCompanyWorker?: boolean;
  userCompanyPermissions?: T_CompanyWorkerPermissionsServer[];
  userRoles?: T_UserRolesServer[];
  workerCompanyPermissions?: T_CompanyWorkerPermissionsServer[];
  workerCompanyRoles?: T_CompanyWorkerRoles[];
};

type T_RequireUserSessionResult = {
  companyWorkerId: null | string;
  companyWorkerSettingsId: null | string;
  userCompanyId: null | string;
  userId: string;
  userSessionVersion: null | number;
};

export const requireUserSession = async ({
  params,
  redirectPath = E_Routes.home,
  request,
  respectCompany,
  respectCompanyWorkerId,
  skipsPermissionsIfUserIsCompanyWorker,
  userCompanyPermissions = [],
  userRoles,
  workerCompanyPermissions = [],
  workerCompanyRoles = [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
}: T_RequireUserSession): Promise<T_RequireUserSessionResult> => {
  await applyRateLimit({ request });

  const redirectOnError = await responseGetOnFailure({ redirectPath, request });
  let companyWorkerId: null | string = params?.workerId ?? null;
  let companyWorkerSettingsId: null | string = null;
  let isForceUserIsCompanyWorker = false;
  if (
    !isEnableCreateOrLoginCompanyServer() &&
    (respectCompany || respectCompanyWorkerId)
  ) {
    throw redirectOnError;
  }

  if (respectCompanyWorkerId) {
    if (!params || !respectCompany) {
      console.warn("Bad configuration. You must add params.");
      throw redirectOnError;
    }

    if (params?.workerId) {
      companyWorkerId = params?.workerId;
    } else {
      throw redirectOnError;
    }
  } else if (workerCompanyPermissions.length > 0) {
    console.warn("You selected worker permissions, but worker id is undefined");
  }
  const { userCompanyId, userId, userSessionVersion } =
    await getUserFromSession({
      request,
      roles: userRoles,
    });

  let validRespectCompany = true;
  if (typeof respectCompany === "boolean") {
    validRespectCompany = false;
    if (respectCompany && userCompanyId) {
      validRespectCompany = true;
    }

    if (!respectCompany && !userCompanyId) {
      validRespectCompany = true;
    }
  }

  if (!userId || !validRespectCompany) {
    throw redirectOnError;
  }

  if (skipsPermissionsIfUserIsCompanyWorker) {
    if (userId && companyWorkerId) {
      isForceUserIsCompanyWorker = userId === companyWorkerId;
    } else {
      console.warn(
        "In skipsPermissionsIfUserIsCompanyWorker userId and workerId is no correct",
      );
      throw redirectOnError;
    }
  }

  if (respectCompanyWorkerId) {
    if (!userCompanyId || !companyWorkerId) {
      throw redirectOnError;
    }

    const resultCompanyWorker = await checkIsCompanyHaveUserIdInWorkers({
      companyId: userCompanyId,
      workerId: companyWorkerId,
      workerPermissions: isForceUserIsCompanyWorker
        ? []
        : workerCompanyPermissions,
      workerRoles: workerCompanyRoles,
    });

    if (!resultCompanyWorker?.isValid) {
      throw redirectOnError;
    }

    companyWorkerSettingsId = resultCompanyWorker.workerSettingsId;
  }

  if (userCompanyPermissions?.length > 0) {
    if (!userCompanyId) {
      throw redirectOnError;
    }

    const isValidUserCompanyPermissions = await checkIsUserHasPermissions({
      companyId: userCompanyId,
      permissions: isForceUserIsCompanyWorker ? [] : userCompanyPermissions,
      roles: userRoles,
      userId,
    });

    if (!isValidUserCompanyPermissions) {
      throw redirectOnError;
    }
  }

  return {
    companyWorkerId,
    companyWorkerSettingsId,
    userCompanyId,
    userId,
    userSessionVersion,
  };
};

export const requireAdminSession = async ({
  redirectPath = E_Routes.home,
  request,
  respectCompany = false,
  userRoles = [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
}: T_RequireUserSession) => {
  const redirectOnError = await responseGetOnFailure({ redirectPath, request });

  await applyRateLimit({ request });

  try {
    const { userId, userSessionVersion } = await requireUserSession({
      redirectPath,
      request,
      respectCompany,
      userRoles,
    });

    const existingUser = await database.user.findUnique({
      select: {
        authenticator2FA: {
          select: {
            enabledAt: true,
          },
        },
        authenticatorEmailOTP: {
          select: {
            enabledAt: true,
          },
        },
        blockedAt: false,
        companyId: true,
        id: true,
        role: true,
        sessionVersion: true,
      },
      where: {
        emailVerification: {
          NOT: {
            verifiedAt: null,
          },
        },
        id: userId,
        role: {
          in: userRoles,
        },
      },
    });

    if (!existingUser) {
      throw redirectOnError;
    }

    if (
      existingUser?.role !== E_RolesServer.ADMIN &&
      existingUser?.role !== E_RolesServer.ADMIN_SUPER
    ) {
      throw redirectOnError;
    }

    if (userSessionVersion !== existingUser?.sessionVersion) {
      throw redirectOnError;
    }

    if (
      !existingUser?.authenticator2FA?.enabledAt &&
      !existingUser?.authenticatorEmailOTP?.enabledAt
    ) {
      throw redirectOnError;
    }

    if (existingUser.companyId) {
      throw redirectOnError;
    }

    return {
      userId: existingUser.id,
      userSessionVersion: existingUser.sessionVersion,
    };
  } catch {
    throw redirectOnError;
  }
};

type T_RequireDevelopmentVersion = {
  redirectPath?: E_Routes;
  request: Request;
};

export const requireDevelopmentVersion = async ({
  redirectPath = E_Routes.home,
  request,
}: T_RequireDevelopmentVersion) => {
  const redirectOnError = await responseGetOnFailure({ redirectPath, request });
  if (environment("LOCAL_ENV")?.toLowerCase() !== "dev") {
    throw redirectOnError;
  }

  if (!isShowDevelopmentHelpersServer()) {
    throw redirectOnError;
  }

  return null;
};

type T_RequireNoUserSession = {
  onErrorThrowError?: boolean;
  redirectPath?: E_Routes;
  request: Request;
  roles?: T_UserRolesServer[];
};

export const requireNoUserSession = async ({
  onErrorThrowError = true,
  redirectPath = E_Routes.login,
  request,
  roles,
}: T_RequireNoUserSession) => {
  const { userId } = await getUserFromSession({ request, roles });

  if (userId) {
    if (onErrorThrowError) {
      const redirectOnError = await responseGetOnFailure({
        redirectPath,
        request,
      });
      throw redirectOnError;
    } else {
      return {
        isError: true,
      };
    }
  }

  return {
    isError: false,
  };
};

import type { T_CompanyWorker } from "~/models/company/companyWorker";

import { database } from "./database.server";
import {
  E_CompanyWorkerPermissionsServer,
  E_RolesServer,
} from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  prismaSelectCompanyFreeTrial,
  prismaSelectSubscription,
  prismaSelectWorker,
} from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnSuccess,
} from "./response.server";
import { getCompanyActivePlan } from "./subscription.server";

type T_GetDataCompanyWorkerResult = {
  companyWorker: null | T_CompanyWorker;
  responseError?: Response;
};

export const getDataCompanyWorker = async ({
  companyWorkerId,
  forceUserOwner,
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  companyWorkerId: null | string | undefined;
  forceUserOwner?: boolean;
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}): Promise<T_GetDataCompanyWorkerResult> => {
  const redirectOnError = await responseGetOnFailure({ request });

  if (!companyWorkerId || !userCompanyId) {
    return {
      companyWorker: null,
      responseError: redirectOnError,
    };
  }

  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: true,
      prismaArguments: {
        select: {
          role: true,
        },
        where:
          userId === companyWorkerId || forceUserOwner
            ? {
                id: userId,
                role: {
                  in: forceUserOwner
                    ? [E_RolesServer.B2B_OWNER]
                    : [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
                },
              }
            : {
                id: userId,
                OR: [
                  {
                    role: {
                      in: [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
                    },
                    workerSettings: {
                      permissions: {
                        hasSome: [
                          E_CompanyWorkerPermissionsServer.MANAGE_WORKERS,
                        ],
                      },
                    },
                  },
                  {
                    role: E_RolesServer.B2B_OWNER,
                  },
                ],
              },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      if (responseError.status === 401) {
        return {
          companyWorker: null,
          responseError: (await responseGetOnFailureLogout({
            request,
          })) as Response,
        };
      }

      return {
        companyWorker: null,
        responseError: redirectOnError,
      };
    }

    if (!existingUser?.company?.id) {
      return {
        companyWorker: null,
        responseError: redirectOnError,
      };
    }

    if (existingUser?.company?.id !== userCompanyId) {
      return {
        companyWorker: null,
        responseError: redirectOnError,
      };
    }

    const foundWorker = await database.user.findUnique({
      select: prismaSelectWorker,
      where: {
        blockedAt: null,
        companyId: existingUser.company.id,
        id: companyWorkerId,
        role: {
          in: [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
        },
      },
    });

    if (!foundWorker) {
      return {
        companyWorker: null,
        responseError: redirectOnError,
      };
    }

    return {
      companyWorker: foundWorker,
      responseError: undefined,
    };
  } catch {
    return {
      companyWorker: null,
      responseError: redirectOnError,
    };
  }
};

export const getCompanyWorker = async ({
  companyWorkerId,
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  companyWorkerId: null | string | undefined;
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const resultWorker = await getDataCompanyWorker({
    companyWorkerId,
    request,
    userCompanyId,
    userId,
    userSessionVersion,
  });

  if (resultWorker.responseError) {
    return resultWorker.responseError;
  }
  const redirectOnError = await responseGetOnFailure({ request });

  if (!resultWorker?.companyWorker) {
    return redirectOnError;
  }

  return await responseOnSuccess({
    data: {
      companyWorker: resultWorker.companyWorker,
    },
    request,
    status: 200,
  });
};

export const getCompanyWorkers = async ({
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
          companyId: userCompanyId,
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

    const foundWorkers = await database.user.findMany({
      orderBy: {
        firstName: "asc",
      },
      select: prismaSelectWorker,
      where: {
        blockedAt: null,
        companyId: userCompanyId,
        role: {
          in: [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
        },
      },
    });

    return await responseOnSuccess({
      data: {
        companyWorkers: foundWorkers,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const checkIfUserCanCreateWorkerAccount = async ({
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

  try {
    if (!userId || !userCompanyId) {
      return redirectOnError;
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: true,
      prismaArguments: {
        select: {
          company: {
            select: {
              freeTrial: {
                select: prismaSelectCompanyFreeTrial,
              },
              subscriptions: {
                select: prismaSelectSubscription,
              },
            },
          },
        },
        where: {
          companyId: userCompanyId,
          id: userId,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError || !existingUser) {
      return redirectOnError;
    }

    const foundActivePlan = getCompanyActivePlan({
      freeTrial: existingUser.company.freeTrial,
      subscriptions: existingUser.company.subscriptions,
    });

    if (!foundActivePlan) {
      return null;
    }

    return null;
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

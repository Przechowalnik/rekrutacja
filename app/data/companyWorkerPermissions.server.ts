import { E_Routes } from "~/constants/routes";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { database } from "./database.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const updateCompanyWorkerPermissions = async ({
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
  if (!userCompanyId || !companyWorkerId) {
    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
      status: 422,
    });
  }

  try {
    const resultValidator = await checkZodValidator({
      arrayData: [formNames.companyWorkerPermission],
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.companyWorkerPermission]:
          zodValidator.companyWorkerPermission.optional(),
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
      company: true,
      prismaArguments: {
        select: {
          company: {
            select: {
              id: true,
            },
          },
        },
        where: {
          companyId: userCompanyId,
          id: userId,
          role: E_RolesServer.B2B_OWNER,
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

    const { authenticator, companyWorkerPermission = [] } =
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

    const foundWorker = await database.companyWorkerSettings.findUnique({
      select: {
        id: true,
        permissions: true,
      },
      where: {
        companyId: userCompanyId,
        NOT: {
          user: {
            role: {
              equals: E_RolesServer.B2B_OWNER,
            },
          },
        },
        userId: companyWorkerId,
      },
    });

    if (!foundWorker) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const foundUpdatedCompanyWorker =
      await database.companyWorkerSettings.update({
        data: {
          permissions: companyWorkerPermission,
        },
        select: {
          id: true,
        },
        where: {
          companyId: userCompanyId,
          userId: companyWorkerId,
        },
      });

    if (!foundUpdatedCompanyWorker) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateCompanyWorkerPermissions",
      },
      redirectTo: {
        extraPath: `/${companyWorkerId}`,
        route: E_Routes.companyWorkerEdit,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { manageFilesInStorage } from "./images.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const deleteCompanyWorkerAccount = async ({
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
  if (!companyWorkerId) {
    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
      status: 422,
    });
  }

  if (userCompanyId === userId) {
    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
      status: 401,
    });
  }

  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.userFirstName]: zodValidator.userFirstName,
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
          id: true,
        },
        where: {
          companyId: userCompanyId,
          id: userId,
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

    const { existingUser: existingWorker, responseError: responseErrorWorker } =
      await getAndCheckUser({
        authenticator: true,
        checkUserSessionVersion: false,
        company: true,
        prismaArguments: {
          select: {
            avatar: true,
            firstName: true,
            id: true,
          },
          where: {
            companyId: userCompanyId,
            id: companyWorkerId,
            role: {
              in: [E_RolesServer.B2B_WORKER],
            },
          },
        },
        request,
        userSessionVersion: null,
      });

    if (responseErrorWorker) {
      return await responseOnFailure(responseErrorWorker);
    }

    if (!existingWorker) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    if (
      resultValidator.data[formNames.userFirstName] !==
      existingWorker?.firstName
    ) {
      return await responseOnFailure({
        message: "badUserName",
        request,
        status: 422,
      });
    }

    if (existingWorker.avatar) {
      await manageFilesInStorage({
        delete: [existingWorker.avatar],
        folder: "avatars",
        type: "images",
      });
    }

    await database.listing.updateMany({
      data: {
        userId: null,
      },
      where: {
        companyId: userCompanyId,
        userId: companyWorkerId,
      },
    });

    await database.user.delete({
      where: {
        companyId: userCompanyId,
        id: companyWorkerId,
        role: {
          in: [E_RolesServer.B2B_WORKER],
        },
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successDeleteCompanyWorker",
        refetchUserSession: true,
      },
      redirectTo: E_Routes.companyWorkers,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

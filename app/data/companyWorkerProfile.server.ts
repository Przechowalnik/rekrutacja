import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { manageFilesInStorage, uploadImageOrVideo } from "./images.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const updateCompanyWorkerProfile = async ({
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
  if (!companyWorkerId || !userCompanyId) {
    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
      status: 422,
    });
  }

  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.userFirstName]: zodValidator.userFirstName,
        [formNames.userLastName]: zodValidator.userLastName.optional(),
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

    const { userFirstName, userLastName = null } = resultValidator.data;

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    await database.user.update({
      data: {
        firstName: userFirstName,
        lastName: userLastName ?? null,
      },
      where: {
        companyId: userCompanyId,
        id: companyWorkerId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateAccount",
        refetchUserSession: companyWorkerId === existingUser.id,
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

export const addAvatarCompanyWorkerProfile = async ({
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
  if (!companyWorkerId || !userCompanyId) {
    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
      status: 422,
    });
  }

  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.fileImage2MB]: zodValidator.fileImage2MB,
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
      authenticator: false,
      company: false,
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
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const { fileImage2MB } = resultValidator.data;
    const resultUploadImage = await uploadImageOrVideo({
      file: fileImage2MB,
      folder: "avatars",
    });

    if (!resultUploadImage.url) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }
    await database.user.update({
      data: {
        avatar: resultUploadImage.url,
      },
      where: {
        companyId: userCompanyId,
        id: companyWorkerId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateAccount",
        refetchUserSession: companyWorkerId === existingUser.id,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const deleteAvatarCompanyWorkerProfile = async ({
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
  if (!companyWorkerId || !userCompanyId) {
    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
      status: 422,
    });
  }

  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: false,
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
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const { existingUser: existingWorker, responseError: responseErrorWorker } =
      await getAndCheckUser({
        authenticator: false,
        checkUserSessionVersion: false,
        company: false,
        prismaArguments: {
          select: { avatar: true },
          where: {
            id: companyWorkerId,
          },
        },
        request,
        userSessionVersion: null,
      });

    if (responseErrorWorker) {
      return await responseOnFailure(responseErrorWorker);
    }

    if (!existingWorker?.avatar) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    await manageFilesInStorage({
      delete: [existingWorker.avatar],
      folder: "avatars",
      type: "images",
    });

    await database.user.update({
      data: {
        avatar: null,
      },
      where: {
        companyId: userCompanyId,
        id: companyWorkerId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateAccount",
        refetchUserSession: companyWorkerId === existingUser.id,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

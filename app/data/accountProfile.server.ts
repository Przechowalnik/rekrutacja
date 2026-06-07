import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { manageFilesInStorage, uploadImageOrVideo } from "./images.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const updateUserProfile = async ({
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
        select: {
          phone: {
            select: {
              countryCode: true,
              number: true,
            },
          },
        },
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

    const { userFirstName, userLastName = null } = resultValidator.data;

    const updatedUser = await database.user.update({
      data: {
        firstName: userFirstName,
        lastName: userLastName ?? null,
      },
      select: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        emailVerification: {
          select: {
            verifiedAt: true,
          },
        },
        firstName: true,
        id: true,
        lang: true,
        lastName: true,
        phone: {
          select: {
            countryCodeToConfirm: true,
            numberToConfirm: true,
            verifiedAt: true,
          },
        },
        role: true,
        sessionVersion: true,
      },
      where: {
        id: userId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateAccount",
        refetchUserSession: true,
      },
      newUserSession: {
        userCompanyId: updatedUser?.company?.id ?? null,
        userCompanyName: updatedUser?.company?.name ?? null,
        userEmailVerification: updatedUser.emailVerification,
        userFirstName: updatedUser.firstName,
        userId: updatedUser.id,
        userLang: updatedUser.lang,
        userLastName: updatedUser.lastName,
        userPhoneVerification: updatedUser.phone,
        userRole: updatedUser.role,
        userSessionVersion: updatedUser.sessionVersion,
      },
      redirectTo: E_Routes.account,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const addAvatarUserProfile = async ({
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
        id: userId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateAccount",
        refetchUserSession: true,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const deleteAvatarUserProfile = async ({
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
      company: false,
      prismaArguments: {
        select: { avatar: true },
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

    if (!existingUser?.avatar) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 4222,
      });
    }

    await manageFilesInStorage({
      delete: [existingUser.avatar],
      folder: "avatars",
      type: "images",
    });

    await database.user.update({
      data: {
        avatar: null,
      },
      where: {
        id: userId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateAccount",
        refetchUserSession: true,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

import { E_Routes } from "~/constants/routes";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { database } from "./database.server";
import { convertToCorrectSlug } from "./functions.server";
import { manageFilesInStorage, uploadImageOrVideo } from "./images.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectCompanyProfile } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const updateCompanyProfile = async ({
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
        [formNames.companyDescription]:
          zodValidator.companyDescription.optional(),
        [formNames.companyName]: zodValidator.companyName,
        [formNames.urlFacebook]: zodValidator.urlFacebook.optional(),
        [formNames.urlInstagram]: zodValidator.urlInstagram.optional(),
        [formNames.urlTiktok]: zodValidator.urlTiktok.optional(),
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
              description: true,
              idnumber: true,
              name: true,
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
      companyDescription,
      companyName,
      urlFacebook,
      urlInstagram,
      urlTiktok,
    } = resultValidator.data;

    const isNewCompanyName =
      companyName?.toLowerCase() !== existingUser.company.name?.toLowerCase();

    if (isNewCompanyName) {
      const countFoundCompanyName = await database.company.count({
        where: {
          name: {
            equals: companyName,
            mode: "insensitive",
          },
        },
      });

      if (countFoundCompanyName > 0) {
        return await responseOnFailure({
          message: "companyNameAlreadyExist",
          request,
          status: 422,
        });
      }
    }

    const slugCompany = convertToCorrectSlug(
      `${existingUser.company.idnumber}-${companyName?.toLowerCase()}`,
    );

    await database.company.update({
      data: {
        description: companyDescription,
        name: companyName,
        slug: slugCompany,
        urlFacebook: urlFacebook ?? null,
        urlInstagram: urlInstagram ?? null,
        urlTiktok: urlTiktok ?? null,
      },
      where: {
        id: existingUser.company.id,
      },
    });

    const updatedUser = await database.user.findFirst({
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

    if (!updatedUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateCompanyProfile",
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
      redirectTo: E_Routes.companyProfile,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const getCompanyProfile = async ({
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
      company: true,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.B2B_OWNER,
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

    const foundCompanyProfile = await database.company.findUnique({
      select: prismaSelectCompanyProfile,
      where: {
        id: existingUser.company.id,
      },
    });

    if (!foundCompanyProfile) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      data: {
        companyProfile: foundCompanyProfile,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const addAvatarCompanyProfile = async ({
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
  if (!userCompanyId) {
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
      company: true,
      prismaArguments: {
        select: {},
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

    await database.company.update({
      data: {
        avatar: resultUploadImage.url,
      },
      where: {
        id: userCompanyId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateCompany",
        refetchUserSession: true,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const deleteAvatarCompanyProfile = async ({
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
  if (!userCompanyId) {
    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
      status: 422,
    });
  }

  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: true,
      prismaArguments: {
        select: {
          company: {
            select: {
              avatar: true,
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

    if (!existingUser?.company?.avatar) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    await manageFilesInStorage({
      delete: [existingUser.company.avatar],
      folder: "avatars",
      type: "images",
    });

    await database.company.update({
      data: {
        avatar: null,
      },
      where: {
        id: userCompanyId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateCompany",
        refetchUserSession: true,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { hashPassword } from "~/data/hash.server";
import { formNames } from "~/lib/zodFormValidator";

import {
  verifyUserAuthenticators,
  verifyUserPassword,
} from "./checkAuthenticator.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const updateUserPassword = async ({
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
      authenticator: true,
      company: false,
      prismaArguments: {
        select: {
          email: true,
          isPasswordSet: true,
          password: true,
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

    const isFirstPasswordSet = !existingUser.isPasswordSet;

    const resultValidator = await checkZodValidator({
      request,
      validator: {
        ...(isFirstPasswordSet
          ? {}
          : { [formNames.authenticator]: zodValidator.authenticator }),
        [formNames.password]: zodValidator.password,
        [formNames.passwordRepeat]: zodValidator.password,
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

    if (!isFirstPasswordSet) {
      const resultVerifyUser2FACode = await verifyUserAuthenticators({
        authenticator: resultValidator.data[formNames.authenticator] as string,
        authenticator2FA: existingUser.authenticator2FA,
        authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
        password: existingUser.password,
        request,
        userId: existingUser.id,
      });

      if (resultVerifyUser2FACode?.responseError) {
        return await responseOnFailure(resultVerifyUser2FACode.responseError);
      }

      const resultVerifyUserPassword = await verifyUserPassword({
        authenticator: resultValidator?.data?.[formNames.password],
        request,
        returnBadPassword: false,
        userPassword: existingUser.password,
      });

      if (!resultVerifyUserPassword.responseError) {
        return await responseOnFailure({
          message: "passwordSameAsPrevious",
          request,
          status: 422,
        });
      }
    }

    const hashedNewPassword = await hashPassword(
      resultValidator.data[formNames.password],
    );

    const updatedUser = await database.user.update({
      data: {
        isPasswordSet: true,
        password: hashedNewPassword,
        sessionVersion: {
          increment: 1,
        },
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
        message: "accountUpdatePassword",
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

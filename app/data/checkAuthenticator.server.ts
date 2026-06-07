import dayjs from "dayjs";

import { database } from "~/data/database.server";
import { checkPassword } from "~/data/hash.server";
import type { T_ResponseOnFailure } from "~/data/response.server";

import type { T_UserRolesServer } from "./models.server";
import { authenticatorOtpConfig } from "./otplib.server";
import { Z_AuthenticatorCode, Z_Password } from "./zodValidator.server";

type T_AuthenticatorResult = {
  responseError?: T_ResponseOnFailure;
};

type T_VerifiedUserEmailOTPCode = {
  authenticator: number | string;
  authenticatorEmailOTP: {
    code: null | string;
    enabledAt: Date | null;
    expiresAt: Date | null | string;
  } | null;
  request: Request;
  userId: string;
};

export const verifyUserEmailOTPCode = async ({
  authenticator,
  authenticatorEmailOTP,
  request,
  userId,
}: T_VerifiedUserEmailOTPCode): Promise<T_AuthenticatorResult> => {
  if (authenticatorEmailOTP?.enabledAt) {
    const resultZod = await Z_AuthenticatorCode.safeParseAsync(authenticator);
    if (!resultZod.success) {
      return {
        responseError: {
          message: "badAuthenticatorCode",
          request,
          status: 422,
        },
      };
    }

    if (
      !authenticatorEmailOTP?.code ||
      !authenticatorEmailOTP?.expiresAt ||
      !authenticatorEmailOTP?.enabledAt ||
      !resultZod.data
    ) {
      return {
        responseError: {
          message: "somethingWentWrong",
          request,
          status: 422,
        },
      };
    }

    const isCorrectDateExpires = dayjs().isBefore(
      dayjs(authenticatorEmailOTP.expiresAt),
    );

    if (!isCorrectDateExpires) {
      return {
        responseError: {
          message: "emailOTPExpiry",
          request,
          status: 422,
        },
      };
    }

    const verified = await checkPassword(
      resultZod.data.toString(),
      authenticatorEmailOTP.code,
    );

    if (!verified) {
      return {
        responseError: {
          message: "badAuthenticatorCode",
          request,
          status: 422,
        },
      };
    }

    await database.authenticatorEmailOTP.update({
      data: {
        code: undefined,
        expiresAt: undefined,
      },
      where: {
        userId: userId,
      },
    });
  }

  return {
    responseError: undefined,
  };
};

type T_VerifyUserPassword = {
  authenticator: number | string;
  request: Request;
  returnBadPassword?: boolean;
  userPassword: string;
};

export const verifyUserPassword = async ({
  authenticator,
  request,
  returnBadPassword = true,
  userPassword,
}: T_VerifyUserPassword): Promise<T_AuthenticatorResult> => {
  const resultZod = await Z_Password.safeParseAsync(authenticator);
  if (!userPassword || !authenticator || !resultZod.success) {
    return returnBadPassword
      ? {
          responseError: {
            message: "badPassword",
            request,
            status: 422,
          },
        }
      : {
          responseError: {
            message: "badEmailOrPassword",
            request,
            status: 422,
          },
        };
  }

  const isCorrectHashedPassword = await checkPassword(
    resultZod.data,
    userPassword,
  );

  if (!isCorrectHashedPassword) {
    return returnBadPassword
      ? {
          responseError: {
            message: "badPassword",
            request,
            status: 422,
          },
        }
      : {
          responseError: {
            message: "badEmailOrPassword",
            request,
            status: 422,
          },
        };
  }

  return {
    responseError: undefined,
  };
};

type T_VerifyUser2FACode = {
  authenticator: number | string;
  authenticator2FA: {
    enabledAt: Date | null;
    secret: null | string;
  } | null;
  errorMessage?: string;
  request: Request;
};

export const verifyUser2FACode = async ({
  authenticator,
  authenticator2FA,
  errorMessage = "badAuthenticatorCode",
  request,
}: T_VerifyUser2FACode): Promise<T_AuthenticatorResult> => {
  if (authenticator2FA?.enabledAt) {
    const resultZod = await Z_AuthenticatorCode.safeParseAsync(authenticator);
    if (!resultZod.success) {
      return {
        responseError: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          message: errorMessage,
          status: 422,
        },
      };
    }

    if (!authenticator2FA?.secret) {
      return {
        responseError: {
          message: "somethingWentWrong",
          request,
          status: 422,
        },
      };
    }

    const verified = authenticatorOtpConfig.check(
      resultZod.data.toString(),
      authenticator2FA?.secret,
    );

    if (!verified) {
      return {
        responseError: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          message: errorMessage,
          status: 422,
        },
      };
    }
  }

  return {
    responseError: undefined,
  };
};

type T_VerifyUserAuthenticators = {
  authenticator: number | string;
  authenticator2FA: {
    enabledAt: Date | null;
    secret: null | string;
  } | null;
  authenticatorEmailOTP: {
    code: null | string;
    enabledAt: Date | null;
    expiresAt: Date | null | string;
  } | null;
  password: string;
  request: Request;
  returnBadPassword?: boolean;
  userId: string;
};

export const verifyUserAuthenticators = async ({
  authenticator,
  authenticator2FA,
  authenticatorEmailOTP,
  password,
  request,
  returnBadPassword = true,
  userId,
}: T_VerifyUserAuthenticators): Promise<T_AuthenticatorResult | undefined> => {
  const [
    resultVerifyUserEmailOTPCode,
    resultVerifyUser2FACode,
    resultVerifyUserPassword,
  ] = await Promise.all([
    verifyUserEmailOTPCode({
      authenticator,
      authenticatorEmailOTP,
      request,
      userId,
    }),
    verifyUser2FACode({
      authenticator,
      authenticator2FA,
      request,
    }),
    !authenticator2FA?.enabledAt && !authenticatorEmailOTP?.enabledAt
      ? verifyUserPassword({
          authenticator,
          request,
          returnBadPassword: returnBadPassword,
          userPassword: password,
        })
      : Promise.resolve(null),
  ]);

  if (resultVerifyUserEmailOTPCode?.responseError) {
    return resultVerifyUserEmailOTPCode;
  }

  if (resultVerifyUser2FACode?.responseError) {
    return resultVerifyUser2FACode;
  }

  if (
    !authenticator2FA?.enabledAt &&
    !authenticatorEmailOTP?.enabledAt &&
    resultVerifyUserPassword?.responseError
  ) {
    return resultVerifyUserPassword;
  }
};

type T_VerifyUserRole = {
  request: Request;
  respectRoles: T_UserRolesServer[];
  userRole: T_UserRolesServer;
};

type T_VerifyUserRoleResult = {
  responseError?: T_ResponseOnFailure;
};

export const verifyUserRole = ({
  request,
  respectRoles,
  userRole,
}: T_VerifyUserRole): T_VerifyUserRoleResult => {
  if (respectRoles.length <= 0 || !userRole) {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 422,
      },
    };
  }

  const roleIsInRespectRoles = respectRoles.includes(userRole);

  if (!roleIsInRespectRoles) {
    return {
      responseError: {
        message: "noPermission",
        request,
        status: 422,
      },
    };
  }

  return {
    responseError: undefined,
  };
};

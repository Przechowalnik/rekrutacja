import dayjs from "dayjs";
import { TFunction } from "i18next";

import { namespaces } from "~/constants/namespaces";
import { queryKey } from "~/constants/queryAndHashes";
import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { hashPassword } from "~/data/hash.server";
import { formNames } from "~/lib/zodFormValidator";
import i18next from "~/localization/i18n.server";

import { requireUserSession } from "./auth.server";
import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { sendEmailOTPCode } from "./emailsGenerator.server";
import { generatePassword, generateRandomDigits } from "./functions.server";
import { authenticatorOtpConfig } from "./otplib.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getAuthenticatorEmailOTPCode = async ({
  request,
}: {
  request: Request;
}) => {
  try {
    const url = new URL(request.url);
    let userId = url.searchParams.get(queryKey.userId);

    let validUserSessionVersion: null | number = null;
    let validUserSession: null | string = null;

    if (!userId) {
      const { userId: userIdFromSession, userSessionVersion } =
        await requireUserSession({
          redirectPath: E_Routes.home,
          request,
        });

      userId = userIdFromSession;
      validUserSessionVersion = userSessionVersion;
      validUserSession = userIdFromSession;

      if (!userId) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 401,
        });
      }
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      checkUserSessionVersion: !!validUserSession,
      company: false,
      prismaArguments: {
        select: {
          email: true,
          lang: true,
        },
        where: {
          authenticatorEmailOTP: {
            NOT: {
              enabledAt: null,
            },
          },
          id: userId,
        },
      },
      request,
      userSessionVersion: validUserSession ? validUserSessionVersion : null,
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

    const generatedNewEmailOTPCode = generateRandomDigits(6);
    const hashedNewEmailCode = await hashPassword(generatedNewEmailOTPCode);
    const emailOTPLoginExpiry = dayjs().add(10, "minutes").toISOString();

    await database.authenticatorEmailOTP.update({
      data: {
        code: hashedNewEmailCode,
        expiresAt: emailOTPLoginExpiry,
      },
      where: {
        userId: userId,
      },
    });

    const resultSendEmail = await sendEmailOTPCode({
      code: generatedNewEmailOTPCode,
      request,
      toEmail: existingUser.email,
      userLanguage: existingUser.lang,
    });

    return await responseOnSuccess({
      data: {
        ...resultSendEmail,
      },
      request,
      status: 201,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const getUserNewAuthenticator2FA = async ({
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
      prismaArguments: {
        select: {
          authenticator2FA: true,
          email: true,
          lang: true,
        },
        where: {
          id: userId,
          OR: [
            {
              authenticator2FA: {
                enabledAt: null,
                secret: null,
              },
            },
            {
              authenticator2FA: null,
            },
          ],
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

    const temporarySecret = authenticatorOtpConfig.generateSecret();

    const t: TFunction<"common", undefined> = await i18next.getFixedT(
      existingUser.lang.toLowerCase(),
      namespaces.common,
    );

    const uri = authenticatorOtpConfig.keyuri(
      userId,
      t("company.name"),
      temporarySecret,
    );

    await (existingUser.authenticator2FA
      ? database.authenticator2FA.update({
          data: {
            enabledAt: null,
            tempSecret: temporarySecret,
          },
          where: {
            userId: existingUser.id,
          },
        })
      : database.authenticator2FA.create({
          data: {
            enabledAt: null,
            tempSecret: temporarySecret,
            userId: existingUser.id,
          },
        }));

    return await responseOnSuccess({
      data: {
        qrCode: uri,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const updateUserAuthenticator = async ({
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
        [formNames.checkboxAuthenticator2FA]: zodValidator.checkbox,
        [formNames.checkboxAuthenticatorEmailOTP]: zodValidator.checkbox,
        [formNames.code]: zodValidator.code.optional(),
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

    const {
      authenticator,
      checkboxAuthenticator2FA,
      checkboxAuthenticatorEmailOTP,
    } = resultValidator.data;

    if (checkboxAuthenticator2FA && checkboxAuthenticatorEmailOTP) {
      return await responseOnFailure({
        message: "errorsInFormAuthenticator",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: true,
      prismaArguments: {
        select: {
          authenticator2FA: true,
          email: true,
        },
        where: {
          emailVerification: {
            NOT: {
              verifiedAt: null,
            },
          },
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

    if (checkboxAuthenticator2FA) {
      const code2FA = resultValidator.data[formNames.code];
      if (!code2FA) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      if (!existingUser?.authenticator2FA?.tempSecret) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      const verified = authenticatorOtpConfig.check(
        code2FA.toString(),
        existingUser.authenticator2FA?.tempSecret,
      );

      if (!verified) {
        return await responseOnFailure({
          message: "bad2FACodeOnCreate",
          refetchUserSession: true,
          request,
          status: 422,
        });
      }

      const backupCode = generatePassword();
      const hashedBackupCode = await hashPassword(backupCode);

      await database.authenticator2FA.update({
        data: {
          backupCode: hashedBackupCode,
          enabledAt: dayjs().toDate(),
          secret: existingUser.authenticator2FA.tempSecret,
          tempSecret: null,
        },
        where: {
          enabledAt: null,
          tempSecret: existingUser.authenticator2FA.tempSecret,
          userId: existingUser.id,
        },
      });

      await database.authenticatorEmailOTP.deleteMany({
        where: {
          userId: existingUser.id,
        },
      });

      const updatedUser = await database.user.update({
        data: {
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
          message: "added2FA",
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
        request,
        status: 200,
      });
    } else if (checkboxAuthenticatorEmailOTP) {
      await (existingUser.authenticatorEmailOTP
        ? database.authenticatorEmailOTP.update({
            data: {
              enabledAt: dayjs().toDate(),
            },
            where: {
              id: existingUser.id,
            },
          })
        : database.authenticatorEmailOTP.create({
            data: {
              code: undefined,
              enabledAt: dayjs().toDate(),
              expiresAt: dayjs().toDate(),
              userId: existingUser.id,
            },
          }));

      await database.authenticator2FA.deleteMany({
        where: {
          userId: existingUser.id,
        },
      });

      const updatedUser = await database.user.update({
        data: {
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
          message: "addedEmailOTP",
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
        request,
        status: 200,
      });
    } else {
      await database.authenticatorEmailOTP.deleteMany({
        where: {
          userId: existingUser.id,
        },
      });

      await database.authenticator2FA.deleteMany({
        where: {
          userId: existingUser.id,
        },
      });

      const updatedUser = await database.user.update({
        data: {
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
          message: "disabledAuthenticator",
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
        request,
        status: 200,
      });
    }
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

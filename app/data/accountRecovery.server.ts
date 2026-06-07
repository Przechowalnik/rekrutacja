import dayjs from "dayjs";
import { redirect } from "react-router";

import { queryKey } from "~/constants/queryAndHashes";
import { E_Routes, getRoute } from "~/constants/routes";
import { database } from "~/data/database.server";
import {
  generateDomainLink,
  generateRandomString,
  getLocalizedPathByLang,
} from "~/data/functions.server";
import { formNames } from "~/lib/zodFormValidator";

import {
  verifyUser2FACode,
  verifyUserEmailOTPCode,
} from "./checkAuthenticator.server";
import { checkRecaptcha } from "./checkRecaptcha.server";
import {
  sendChangedPassword,
  sendRecoveryAccountPassword,
} from "./emailsGenerator.server";
import { checkPassword, hashPassword } from "./hash.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const reset2FAAccount = async ({ request }: { request: Request }) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.codeReset2FA]: zodValidator.codeReset2FA,
        [formNames.userId]: zodValidator.userId,
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
      checkUserSessionVersion: false,
      company: false,
      prismaArguments: {
        select: {
          authenticator2FA: {
            select: {
              backupCode: true,
              enabledAt: true,
              secret: true,
            },
          },
          email: true,
          password: true,
        },
        where: {
          authenticator2FA: {
            NOT: {
              enabledAt: null,
            },
          },
          id: resultValidator.data[formNames.userId],
        },
      },
      request,
      userSessionVersion: null,
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

    if (
      !existingUser?.password ||
      !existingUser?.authenticator2FA?.enabledAt ||
      !existingUser?.authenticator2FA?.secret ||
      !existingUser?.authenticator2FA?.backupCode
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const isCorrectHashedBackupCode = await checkPassword(
      resultValidator.data[formNames.codeReset2FA],
      existingUser.authenticator2FA.backupCode,
    );
    if (!isCorrectHashedBackupCode) {
      return await responseOnFailure({
        message: "recoveryAccountBadCodeReset2FA",
        request,
        status: 422,
      });
    }

    await database.authenticator2FA.delete({
      where: {
        userId: existingUser.id,
      },
    });

    await database.user.update({
      data: {
        sessionVersion: {
          increment: 1,
        },
      },
      where: {
        id: existingUser.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "recoveryReset2FAAccountSuccess",
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const confirmRecoveryAccount = async ({
  request,
}: {
  request: Request;
}) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator.optional(),
        [formNames.code]: zodValidator.codeRecoveryPassword,
        [formNames.password]: zodValidator.password,
        [formNames.passwordRepeat]: zodValidator.password,
        [formNames.userId]: zodValidator.userId,
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
      checkUserSessionVersion: false,
      company: false,
      prismaArguments: {
        select: {
          authenticator2FA: {
            select: {
              enabledAt: true,
              secret: true,
            },
          },
          authenticatorEmailOTP: {
            select: {
              code: true,
              enabledAt: true,
              expiresAt: true,
            },
          },
          email: true,
          lang: true,
          recoveryAccount: {
            select: {
              code: true,
              expiresAt: true,
            },
          },
        },
        where: {
          id: resultValidator?.data?.[formNames.userId],
          recoveryAccount: {
            expiresAt: {
              gte: dayjs().toDate(),
            },
          },
        },
      },
      request,
      userSessionVersion: null,
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

    if (!existingUser?.recoveryAccount?.expiresAt) {
      return await responseOnFailure({
        message: "recoveryAccountExpires",
        request,
        status: 422,
      });
    }

    const isCorrectDateExpires = dayjs().isBefore(
      dayjs(existingUser.recoveryAccount.expiresAt),
    );

    if (!isCorrectDateExpires) {
      return await responseOnFailure({
        message: "recoveryAccountExpires",
        request,
        status: 422,
      });
    }

    const isCorrectHashedPassword = await checkPassword(
      resultValidator?.data?.[formNames.code].toString(),
      existingUser.recoveryAccount?.code,
    );

    if (!isCorrectHashedPassword) {
      return await responseOnFailure({
        message: "recoveryAccountExpires",
        request,
        status: 422,
      });
    }

    if (
      (existingUser?.authenticator2FA?.enabledAt ||
        existingUser?.authenticatorEmailOTP?.enabledAt) &&
      !resultValidator.data[formNames.authenticator]
    ) {
      return await responseOnSuccess({
        data: {
          authenticator2FAEnabled: existingUser?.authenticator2FA?.enabledAt,
          authenticatorEmailOTPEnabled:
            existingUser?.authenticatorEmailOTP?.enabledAt,
          userId: existingUser.id,
        },
        request,
        status: 200,
      });
    }

    if (existingUser?.authenticatorEmailOTP?.enabledAt) {
      const authenticatorToValid =
        resultValidator.data[formNames.authenticator];
      if (!authenticatorToValid) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      const resultVerifyUserEmailOTPCode = await verifyUserEmailOTPCode({
        authenticator: authenticatorToValid,
        authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
        request,
        userId: existingUser.id,
      });

      if (resultVerifyUserEmailOTPCode.responseError) {
        return await responseOnFailure(
          resultVerifyUserEmailOTPCode.responseError,
        );
      }
    }

    if (existingUser?.authenticator2FA?.enabledAt) {
      const authenticatorToValid =
        resultValidator.data[formNames.authenticator];
      if (!authenticatorToValid) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      const resultVerifyUser2FACode = await verifyUser2FACode({
        authenticator: authenticatorToValid,
        authenticator2FA: existingUser.authenticator2FA,
        request,
      });

      if (resultVerifyUser2FACode.responseError) {
        return await responseOnFailure(resultVerifyUser2FACode.responseError);
      }
    }

    const hashedNewPassword = await hashPassword(
      resultValidator.data[formNames.password],
    );

    await database.user.update({
      data: {
        password: hashedNewPassword,
        sessionVersion: {
          increment: 1,
        },
      },
      where: {
        blockedAt: null,
        id: existingUser.id,
      },
    });

    await database.accountRecovery.deleteMany({
      where: {
        userId: resultValidator?.data?.[formNames.userId],
      },
    });

    await sendChangedPassword({
      request,
      toEmail: existingUser.email,
      userLanguage: existingUser.lang,
    });

    return await responseOnSuccess({
      flashData: {
        message: "recoveryAccountSuccess",
      },
      redirectTo: E_Routes.login,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const getRecoveryLinkToAccount = async ({
  request,
}: {
  request: Request;
}) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.email]: zodValidator.email,
        [formNames.recaptcha]: zodValidator.recaptcha,
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

    const isCorrectCaptcha = await checkRecaptcha(
      resultValidator?.data?.[formNames.recaptcha],
    );

    if (!isCorrectCaptcha) {
      return await responseOnFailure({
        message: "badRecaptcha",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      checkUserSessionVersion: false,
      company: false,
      prismaArguments: {
        select: {
          email: true,
          lang: true,
          recoveryAccount: {
            select: {
              id: true,
            },
          },
        },
        where: {
          email: resultValidator.data[formNames.email],
        },
      },
      request,
      userSessionVersion: null,
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

    const backupCode = generateRandomString(16);
    const hashedBackupCode = await hashPassword(backupCode);

    await (existingUser?.recoveryAccount?.id
      ? database.accountRecovery.update({
          data: {
            code: hashedBackupCode,
            expiresAt: dayjs().add(1, "day").toDate(),
          },
          where: {
            id: existingUser.recoveryAccount.id,
            userId: existingUser?.id,
          },
        })
      : database.accountRecovery.create({
          data: {
            code: hashedBackupCode,
            expiresAt: dayjs().add(1, "day").toDate(),
            userId: existingUser?.id,
          },
        }));

    const resultSendEmail = await sendRecoveryAccountPassword({
      recoveryLink: `${generateDomainLink(request)}${getLocalizedPathByLang(
        getRoute({
          extraQuery: {
            [queryKey.code]: backupCode,
            [queryKey.userId]: existingUser.id,
          },
          route: E_Routes.recoveryAccountChangePassword,
        }),
        existingUser.lang,
      )}`,
      request,
      toEmail: existingUser.email,
      userLanguage: existingUser.lang,
    });

    if (resultSendEmail?.recoveryLink) {
      return redirect(resultSendEmail?.recoveryLink);
    }

    return await responseOnSuccess({
      flashData: {
        message: "recoveryLinkHasBeenSend",
      },
      redirectTo: E_Routes.login,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

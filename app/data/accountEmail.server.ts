import dayjs from "dayjs";

import { queryKey } from "~/constants/queryAndHashes";
import { E_Routes, getRoute } from "~/constants/routes";
import { database } from "~/data/database.server";
import { checkPassword, hashPassword } from "~/data/hash.server";
import { formNames } from "~/lib/zodFormValidator";
import { E_Roles } from "~/models/enums";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import {
  sendBackupChangedEmail,
  sendChangedEmail,
  sendEmailIsVerified,
  sendVerifiedNewEmail,
} from "./emailsGenerator.server";
import {
  generateDomainLink,
  generateRandomDigits,
  generateRandomString,
  getLocalizedPathByLang,
} from "./functions.server";
import { sendVerifiedSMS } from "./hostedSms.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const backupUserEmail = async ({ request }: { request: Request }) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.code]: zodValidator.code,
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
          email: true,
          emailVerification: {
            select: {
              oldEmail: true,
              oldEmailBackupCode: true,
              oldEmailBackupCodeExpiresAt: true,
            },
          },
        },
        where: {
          blockedAt: null,
          emailVerification: {
            NOT: {
              verifiedAt: null,
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
      !existingUser?.emailVerification?.oldEmail ||
      !existingUser?.emailVerification?.oldEmailBackupCode ||
      !existingUser?.emailVerification?.oldEmailBackupCodeExpiresAt
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const isCorrectDateExpires = dayjs().isBefore(
      dayjs(existingUser.emailVerification.oldEmailBackupCodeExpiresAt),
    );

    if (!isCorrectDateExpires) {
      return await responseOnFailure({
        message: "backupEmailExpires",
        request,
        status: 422,
      });
    }

    const isCorrectHashedPassword = await checkPassword(
      resultValidator.data[formNames.code].toString(),
      existingUser.emailVerification?.oldEmailBackupCode,
    );

    if (!isCorrectHashedPassword) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const countSomeUserHasNewEmail = await database.user.count({
      where: {
        email: existingUser.emailVerification.oldEmailBackupCode,
      },
    });

    if (countSomeUserHasNewEmail > 0) {
      return await responseOnFailure({
        message: "userEmailExisting",
        request,
        status: 422,
      });
    }

    const updatedUser = await database.user.update({
      data: {
        email: existingUser.emailVerification.oldEmail.toLowerCase(),
        emailVerification: {
          update: {
            data: {
              newEmailToVerified: null,
              newEmailToVerifiedCode: null,
              oldEmail: null,
              oldEmailBackupCode: null,
              oldEmailBackupCodeExpiresAt: null,
            },
            where: {
              userId: existingUser.id,
            },
          },
        },
      },
      select: {
        email: true,
        lang: true,
      },
      where: {
        id: existingUser.id,
      },
    });

    await sendBackupChangedEmail({
      request,
      toEmail: updatedUser.email,
      userLanguage: updatedUser.lang,
    });

    return await responseOnSuccess({
      flashData: {
        message: "successBackupEmail",
      },
      redirectTo: E_Routes.login,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const confirmCodeUserEmail = async ({
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
        [formNames.code]: zodValidator.code,
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

    const existingUser = await database.user.findUnique({
      select: {
        avatar: true,
        blockedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            phone: {
              select: {
                codeExpires: true,
                countryCodeToConfirm: true,
                numberToConfirm: true,
                verifiedAt: true,
              },
            },
          },
        },
        email: true,
        emailVerification: {
          select: {
            code: true,
            newEmailToVerified: true,
            newEmailToVerifiedCode: true,
            oldEmailBackupCodeExpiresAt: true,
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

    if (!existingUser) {
      return await responseOnFailure({
        message: "notFoundUserWithoutMessage",
        request,
        status: 422,
      });
    }

    if (existingUser.blockedAt) {
      return await responseOnFailure({
        message: "userIsBlocked",
        request,
        status: 404,
      });
    }

    if (existingUser.sessionVersion !== userSessionVersion) {
      return await responseOnFailure({
        message: "sessionExpired",
        request,
        status: 401,
      });
    }

    if (
      existingUser?.emailVerification?.code &&
      !existingUser?.emailVerification?.verifiedAt
    ) {
      const isCorrectHashedPassword = await checkPassword(
        resultValidator.data[formNames.code].toString(),
        existingUser.emailVerification?.code,
      );

      if (!isCorrectHashedPassword) {
        return await responseOnFailure({
          message: "badCodeToConfirmEmail",
          request,
          status: 422,
        });
      }

      const resultUpdateEmail = await database.emailVerification.update({
        data: {
          code: null,
          verifiedAt: dayjs().toDate(),
        },
        select: {
          verifiedAt: true,
        },
        where: {
          userId: userId,
        },
      });

      await sendEmailIsVerified({
        request,
        toEmail: existingUser.email,
        userLanguage: existingUser.lang,
      });

      if (
        existingUser?.company?.phone &&
        !existingUser?.company?.phone?.verifiedAt &&
        existingUser?.role === E_Roles.B2B_OWNER
      ) {
        if (
          !existingUser?.company?.phone?.countryCodeToConfirm ||
          !existingUser?.company?.phone?.numberToConfirm
        ) {
          return await responseOnFailure({
            message: "somethingWentWrong",
            request,
            status: 422,
          });
        }

        const generatedPhoneCode = generateRandomDigits(6);
        const hashedPhoneCode = await hashPassword(generatedPhoneCode);

        await database.companyPhone.update({
          data: {
            code: hashedPhoneCode,
          },
          where: {
            companyId: existingUser.company.id,
          },
        });

        const resultSendEmail = await sendVerifiedSMS({
          codePhone: generatedPhoneCode,
          phone: {
            countryCodeToConfirm:
              existingUser.company.phone.countryCodeToConfirm,
            numberToConfirm: existingUser.company.phone.numberToConfirm,
          },
          request,
          userLanguage: existingUser.lang,
        });

        return await responseOnSuccess({
          data: {
            ...resultSendEmail,
          },
          flashData: {
            message: "successConfirmEmailAndSendSMS",
            refetchUserSession: true,
          },
          newUserSession: {
            userCompanyId: existingUser?.company?.id ?? null,
            userCompanyName: existingUser?.company?.name ?? null,
            userEmailVerification: existingUser.emailVerification,
            userFirstName: existingUser.firstName,
            userId: existingUser.id,
            userLang: existingUser.lang,
            userLastName: existingUser.lastName,
            userPhoneVerification: existingUser.phone,
            userRole: existingUser.role,
            userSessionVersion: existingUser.sessionVersion,
          },
          request,
          status: 200,
        });
      }

      return await responseOnSuccess({
        flashData: {
          message: "successConfirmEmail",
          refetchUserSession: true,
        },
        newUserSession: {
          userCompanyId: existingUser?.company?.id ?? null,
          userCompanyName: existingUser?.company?.name ?? null,
          userEmailVerification: resultUpdateEmail,
          userFirstName: existingUser.firstName,
          userId: existingUser.id,
          userLang: existingUser.lang,
          userLastName: existingUser.lastName,
          userPhoneVerification: existingUser.phone,
          userRole: existingUser.role,
          userSessionVersion: existingUser.sessionVersion,
        },
        request,
        status: 200,
      });
    } else if (
      existingUser?.emailVerification?.verifiedAt &&
      existingUser?.emailVerification?.newEmailToVerified &&
      existingUser?.emailVerification?.newEmailToVerifiedCode
    ) {
      if (existingUser?.emailVerification?.oldEmailBackupCodeExpiresAt) {
        const isCorrectDateExpires = dayjs().isBefore(
          dayjs(existingUser.emailVerification.oldEmailBackupCodeExpiresAt),
        );

        if (isCorrectDateExpires) {
          return await responseOnFailure({
            message: "limitChangeEmail",
            request,
            status: 422,
          });
        }
      }

      const isCorrectHashedPassword = await checkPassword(
        resultValidator.data[formNames.code].toString(),
        existingUser.emailVerification?.newEmailToVerifiedCode,
      );

      if (!isCorrectHashedPassword) {
        return await responseOnFailure({
          message: "badCodeToConfirmEmail",
          request,
          status: 422,
        });
      }

      const backupCode = generateRandomString(16);
      const hashedBackupCode = await hashPassword(backupCode);

      const countSomeUserHasNewEmail = await database.user.count({
        where: {
          email: existingUser.emailVerification.newEmailToVerified,
        },
      });

      if (countSomeUserHasNewEmail > 0) {
        return await responseOnFailure({
          message: "userEmailExisting",
          request,
          status: 422,
        });
      }

      const updatedUser = await database.user.update({
        data: {
          email: existingUser.emailVerification.newEmailToVerified,
          emailVerification: {
            update: {
              data: {
                newEmailToVerified: null,
                newEmailToVerifiedCode: null,
                oldEmail: existingUser.email,
                oldEmailBackupCode: hashedBackupCode,
                oldEmailBackupCodeExpiresAt: dayjs().add(1, "day").toDate(),
              },
            },
          },
          sessionVersion: {
            increment: 1,
          },
          socials: {
            update: {
              facebookAccessToken: null,
              facebookAccessTokenExpiresAt: null,
              facebookId: null,
              googleAccessToken: null,
              googleAccessTokenExpiresAt: null,
              googleId: null,
            },
          },
        },
        select: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          companyId: true,
          email: true,
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

      const resultSendEmail = await sendChangedEmail({
        recoveryLink: `${generateDomainLink(request)}${getLocalizedPathByLang(
          getRoute({
            extraQuery: {
              [queryKey.code]: backupCode,
              [queryKey.userId]: existingUser.id,
            },
            route: E_Routes.recoveryAccountBackupEmail,
          }),
          updatedUser.lang,
        )}`,
        request,
        toEmail: existingUser.email,
        userLanguage: updatedUser.lang,
      });

      await sendEmailIsVerified({
        request,
        toEmail: updatedUser.email,
        userLanguage: updatedUser.lang,
      });
      return await responseOnSuccess({
        data: {
          ...resultSendEmail,
        },
        flashData: {
          message: "successConfirmEmail",
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

export const updateUserEmail = async ({
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
        [formNames.email]: zodValidator.email,
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
          email: true,
          emailVerification: {
            select: {
              oldEmailBackupCodeExpiresAt: true,
            },
          },
          lang: true,
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

    if (resultValidator.data[formNames.email] === existingUser.email) {
      return await responseOnFailure({
        message: "newUserEmailTheSame",
        request,
        status: 422,
      });
    }

    if (existingUser?.emailVerification?.oldEmailBackupCodeExpiresAt) {
      const isCorrectDateExpires = dayjs().isBefore(
        dayjs(existingUser.emailVerification.oldEmailBackupCodeExpiresAt),
      );

      if (isCorrectDateExpires) {
        return await responseOnFailure({
          message: "limitChangeEmail",
          request,
          status: 422,
        });
      }
    }

    const countSomeUserHasNewEmail = await database.user.count({
      where: {
        email: resultValidator.data[formNames.email].toLowerCase(),
      },
    });

    if (countSomeUserHasNewEmail > 0) {
      return await responseOnFailure({
        message: "userEmailExisting",
        request,
        status: 422,
      });
    }
    const generatedNewEmailCode = generateRandomDigits(6);
    const hashedNewEmailCode = await hashPassword(generatedNewEmailCode);

    await database.emailVerification.update({
      data: {
        newEmailToVerified: resultValidator.data[formNames.email].toLowerCase(),
        newEmailToVerifiedCode: hashedNewEmailCode,
      },
      where: {
        userId: existingUser.id,
      },
    });

    const resultSendEmail = await sendVerifiedNewEmail({
      code: generatedNewEmailCode,
      request,
      toEmail: resultValidator.data[formNames.email],
      userLanguage: existingUser.lang,
    });

    return await responseOnSuccess({
      data: {
        ...resultSendEmail,
      },
      flashData: {
        message: "sendedCodeToConfirmEmail",
        refetchUserSession: true,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const sendAgainCodeUserEmail = async ({
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
        select: {
          email: true,
          emailVerification: {
            select: {
              code: true,
              newEmailToVerified: true,
              newEmailToVerifiedCode: true,
              oldEmailBackupCodeExpiresAt: true,
              verifiedAt: true,
            },
          },
          lang: true,
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

    if (existingUser?.emailVerification?.oldEmailBackupCodeExpiresAt) {
      const isCorrectDateExpires = dayjs().isBefore(
        dayjs(existingUser.emailVerification.oldEmailBackupCodeExpiresAt),
      );

      if (isCorrectDateExpires) {
        return await responseOnFailure({
          message: "limitChangeEmail",
          request,
          status: 422,
        });
      }
    }

    const generatedNewEmailCode = generateRandomDigits(6);
    const hashedNewEmailCode = await hashPassword(generatedNewEmailCode);

    if (!existingUser.emailVerification?.verifiedAt) {
      if (!existingUser.email) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      await database.emailVerification.update({
        data: {
          code: hashedNewEmailCode,
        },
        where: {
          userId: existingUser.id,
        },
      });

      const resultSendEmail = await sendVerifiedNewEmail({
        code: generatedNewEmailCode,
        request,
        toEmail: existingUser.email,
        userLanguage: existingUser.lang,
      });

      return await responseOnSuccess({
        data: {
          ...resultSendEmail,
        },
        flashData: {
          message: "sendedCodeToConfirmEmail",
        },
        request,
        status: 200,
      });
    } else if (existingUser.emailVerification?.newEmailToVerifiedCode) {
      if (!existingUser.emailVerification.newEmailToVerified) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      await database.emailVerification.update({
        data: {
          newEmailToVerifiedCode: hashedNewEmailCode,
        },
        where: {
          userId: existingUser.id,
        },
      });

      const resultSendEmail = await sendVerifiedNewEmail({
        code: generatedNewEmailCode,
        request,
        toEmail: existingUser.emailVerification.newEmailToVerified,
        userLanguage: existingUser.lang,
      });

      return await responseOnSuccess({
        data: {
          ...resultSendEmail,
        },
        flashData: {
          message: "sendedCodeToConfirmEmail",
        },
        request,
        status: 200,
      });
    } else {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

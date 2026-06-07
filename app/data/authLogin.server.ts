import { E_Routes, getRoute } from "~/constants/routes";
import {
  verifyUserAuthenticators,
  verifyUserPassword,
} from "~/data/checkAuthenticator.server";
import { checkRecaptcha } from "~/data/checkRecaptcha.server";
import { formNames } from "~/lib/zodFormValidator";

import { upsertLoginIpForUser } from "./accountIpLogin.server";
import { createUserSession, destroyUserSession } from "./authSession.server";
import { isEnableCreateOrLoginCompanyServer } from "./flags.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { responseOnFailure, responseOnSuccess } from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const login = async ({ request }: { request: Request }) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.email]: zodValidator.email,
        [formNames.password]: zodValidator.password,
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
      company: true,
      prismaArguments: {
        select: {
          authenticator2FA: {
            select: {
              enabledAt: true,
            },
          },
          authenticatorEmailOTP: {
            select: {
              enabledAt: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              settings: {
                select: {
                  loginPasswordAt: true,
                },
              },
            },
          },
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
          firstName: true,
          lang: true,
          lastName: true,
          password: true,
          phone: {
            select: {
              countryCodeToConfirm: true,
              numberToConfirm: true,
              verifiedAt: true,
            },
          },
          role: true,
        },
        where: {
          email: resultValidator?.data?.[formNames.email].toLowerCase(),
        },
      },
      request,
      respectCompanyIfCompanyPropsIsTrue: false,
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

    const resultVerifyUserPassword = await verifyUserPassword({
      authenticator: resultValidator?.data?.[formNames.password],
      request,
      returnBadPassword: false,
      userPassword: existingUser.password,
    });

    if (resultVerifyUserPassword.responseError) {
      return await responseOnFailure(resultVerifyUserPassword.responseError);
    }

    if (existingUser?.company) {
      if (!existingUser.company.settings) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 401,
        });
      }

      if (!existingUser.company.settings.loginPasswordAt) {
        return await responseOnFailure({
          message: "loginFromPassword",
          request,
          status: 401,
        });
      }
    }

    const authenticatorEmailOTPEnabled =
      existingUser?.authenticatorEmailOTP?.enabledAt;
    const authenticator2FAEnabled = existingUser?.authenticator2FA?.enabledAt;

    if (authenticatorEmailOTPEnabled || authenticator2FAEnabled) {
      return await responseOnSuccess({
        data: {
          authenticator2FAEnabled,
          authenticatorEmailOTPEnabled,
          userId: existingUser.id,
        },
        request,
        status: 200,
      });
    }

    if (!isEnableCreateOrLoginCompanyServer() && existingUser?.company) {
      return await responseOnFailure({
        message: "errorOnLoginCompany",
        request,
        status: 401,
      });
    }

    await upsertLoginIpForUser({
      request,
      userId: existingUser.id,
    });

    return createUserSession({
      flashData: {
        message: "userLoggedToSite",
        messageStatus: "success",
        refetchUserSession: true,
      },
      redirectPath: getRoute({
        route: E_Routes.home,
      }),
      request,
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
    });
  } catch {
    return await destroyUserSession({
      isError: true,
      request,
      status: 500,
      withRedirect: false,
    });
  }
};

export const loginOtp = async ({ request }: { request: Request }) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.email]: zodValidator.email,
        [formNames.password]: zodValidator.password,
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
      checkUserSessionVersion: false,
      company: true,
      prismaArguments: {
        select: {
          company: {
            select: {
              id: true,
              name: true,
              settings: {
                select: {
                  loginPasswordAt: true,
                },
              },
            },
          },
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
          firstName: true,
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
        },
        where: {
          email: resultValidator?.data?.[formNames.email].toLowerCase(),
        },
      },
      request,
      respectCompanyIfCompanyPropsIsTrue: false,
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

    const [resultVerifyUserPassword, resultVerifyUser2FACode] =
      await Promise.all([
        verifyUserPassword({
          authenticator: resultValidator?.data?.[formNames.password],
          request,
          returnBadPassword: false,
          userPassword: existingUser.password,
        }),
        verifyUserAuthenticators({
          authenticator: resultValidator.data[formNames.authenticator],
          authenticator2FA: existingUser.authenticator2FA,
          authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
          password: existingUser.password,
          request,
          returnBadPassword: false,
          userId: existingUser.id,
        }),
      ]);

    if (resultVerifyUserPassword.responseError) {
      return await responseOnFailure(resultVerifyUserPassword.responseError);
    }

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    if (existingUser?.company) {
      if (!existingUser.company.settings) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 401,
        });
      }

      if (!existingUser.company.settings.loginPasswordAt) {
        return await responseOnFailure({
          message: "loginFromPassword",
          request,
          status: 401,
        });
      }
    }

    if (!isEnableCreateOrLoginCompanyServer() && existingUser?.company) {
      return await responseOnFailure({
        message: "errorOnLoginCompany",
        request,
        status: 401,
      });
    }

    await upsertLoginIpForUser({
      request,
      userId: existingUser.id,
    });

    return createUserSession({
      flashData: {
        message: "userLoggedToSite",
        messageStatus: "success",
        refetchUserSession: true,
      },
      redirectPath: getRoute({
        route: E_Routes.home,
      }),
      request,
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
    });
  } catch {
    return await destroyUserSession({
      isError: true,
      request,
      status: 500,
      withRedirect: false,
    });
  }
};

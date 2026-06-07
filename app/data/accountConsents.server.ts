import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectUserConsents } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const updateUserConsents = async ({
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
        [formNames.checkboxConsentNewsletter]: zodValidator.checkbox,
        [formNames.checkboxConsentOpinion]: zodValidator.checkbox,
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
      prismaArguments: {
        select: {
          consent: true,
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

    const { checkboxConsentNewsletter, checkboxConsentOpinion } =
      resultValidator.data;

    await database.consent.update({
      data: {
        ...(checkboxConsentNewsletter === !!existingUser.consent?.newsletterAt
          ? {}
          : {
              newsletterAt: checkboxConsentNewsletter ? dayjs().toDate() : null,
            }),
        ...(checkboxConsentOpinion === !!existingUser.consent?.opinionAt
          ? {}
          : {
              opinionAt: checkboxConsentOpinion ? dayjs().toDate() : null,
            }),
      },
      where: {
        userId: userId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateConsents",
      },
      redirectTo: E_Routes.account,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const getAccountConsents = async ({
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
    if (!userId) {
      return redirectOnError;
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
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
      if (responseError.status === 401) {
        return await responseGetOnFailureLogout({
          request,
        });
      }

      return redirectOnError;
    }

    if (!existingUser) {
      return redirectOnError;
    }

    const foundUserConsents = await database.consent.findUnique({
      select: prismaSelectUserConsents,
      where: {
        userId,
      },
    });

    if (!foundUserConsents) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      data: {
        userConsent: foundUserConsents,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

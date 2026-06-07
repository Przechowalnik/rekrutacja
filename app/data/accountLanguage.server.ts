import { database } from "~/data/database.server";

import { E_LanguagesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";

export const updateUserLanguage = async ({
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
      prismaArguments: {
        select: {
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

    const updatedUser = await database.user.update({
      data: {
        lang:
          existingUser.lang === E_LanguagesServer.PL
            ? E_LanguagesServer.EN
            : E_LanguagesServer.PL,
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
        message: "successUpdateLanguage",
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
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

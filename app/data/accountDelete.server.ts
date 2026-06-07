import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { destroyUserSession } from "./authSession.server";
import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { manageFilesInStorage } from "./images.server";
import { E_ListingStatusServer, E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { responseOnFailure, responseOnFailureServer } from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const deleteUserAccount = async ({
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
        [formNames.userFirstName]: zodValidator.userFirstName,
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
          avatar: true,
          firstName: true,
          referral: {
            select: {
              code: true,
            },
          },
          role: true,
          stripeCustomerId: true,
        },
        where: {
          company: null,
          id: userId,
          role: E_RolesServer.USER,
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

    if (
      resultValidator.data[formNames.userFirstName] !== existingUser?.firstName
    ) {
      return await responseOnFailure({
        message: "badUserName",
        request,
        status: 422,
      });
    }

    const countActiveListings = await database.listing.count({
      where: {
        expiresAt: { gt: dayjs().toDate() },
        status: E_ListingStatusServer.ACTIVE,
        userId: existingUser.id,
      },
    });

    if (countActiveListings) {
      return await responseOnFailure({
        message: "userHasActiveListings",
        request,
        status: 422,
      });
    }

    if (existingUser.avatar) {
      await manageFilesInStorage({
        delete: [existingUser.avatar],
        folder: "avatars",
        type: "images",
      });
    }

    await database.listing.updateMany({
      data: {
        userId: null,
      },
      where: {
        userId: existingUser.id,
      },
    });

    if (existingUser?.referral?.code) {
      await database.$transaction([
        database.user.updateMany({
          data: {
            createdFromReferralCode: null,
          },
          where: {
            createdFromReferralCode: existingUser?.referral?.code,
          },
        }),
        database.company.updateMany({
          data: {
            createdFromReferralCode: null,
          },
          where: {
            createdFromReferralCode: existingUser?.referral?.code,
          },
        }),
      ]);
    }

    await database.user.delete({
      where: {
        id: existingUser.id,
      },
    });

    return await destroyUserSession({
      message: "accountDeleted",
      request,
      route: E_Routes.login,
      withRedirect: true,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

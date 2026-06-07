import { PrismaPromise } from "@prisma/client/runtime/client";
import dayjs from "dayjs";

import { E_Routes, getRoute } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";
import { E_SubscriptionStatus } from "~/models/enums";

import { createUserSession } from "./authSession.server";
import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { manageFilesInStorage } from "./images.server";
import { E_ListingStatusServer, E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { responseOnFailure, responseOnFailureServer } from "./response.server";
import { stripe } from "./stripe.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const deleteCompanyAccount = async ({
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
      company: true,
      prismaArguments: {
        select: {
          avatar: true,
          company: {
            select: {
              avatar: true,
              bannerHero: true,
              referral: {
                select: {
                  code: true,
                },
              },
              stripe: {
                select: {
                  accountId: true,
                  customerId: true,
                },
              },
            },
          },
          firstName: true,
          id: true,
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

    const foundSubscriptions = await database.subscription.findMany({
      select: {
        id: true,
      },
      where: {
        companyId: existingUser.company.id,
        status: {
          notIn: [
            E_SubscriptionStatus.CANCELLED,
            E_SubscriptionStatus.TO_BE_CANCELLED,
          ],
        },
      },
    });

    if (foundSubscriptions.length > 0) {
      return await responseOnFailure({
        message: "accountHaveActiveSubscriptions",
        request,
        status: 422,
      });
    }

    const countActiveListings = await database.listing.count({
      where: {
        companyId: existingUser.company.id,
        expiresAt: { gt: dayjs().toDate() },
        status: E_ListingStatusServer.ACTIVE,
      },
    });

    if (countActiveListings) {
      return await responseOnFailure({
        message: "companyHasActiveListings",
        request,
        status: 422,
      });
    }

    await database.listing.updateMany({
      data: {
        companyId: null,
        userId: null,
      },
      where: {
        companyId: existingUser.company.id,
      },
    });

    const avatarWorkers = await database.user.findMany({
      select: {
        avatar: true,
      },
      where: {
        avatar: {
          not: null,
        },
        companyId: userCompanyId,
        NOT: {
          id: userId,
        },
      },
    });

    await database.user.deleteMany({
      where: {
        companyId: userCompanyId,
        NOT: {
          id: userId,
        },
      },
    });

    const queries: PrismaPromise<unknown>[] = [
      database.invoice.updateMany({
        data: {
          companyId: null,
        },
        where: {
          companyId: existingUser.company.id,
        },
      }),
      database.subscription.updateMany({
        data: {
          companyId: null,
        },
        where: {
          companyId: existingUser.company.id,
        },
      }),
    ];

    if (existingUser?.company?.referral?.code) {
      queries.push(
        database.user.updateMany({
          data: {
            createdFromReferralCode: null,
          },
          where: {
            createdFromReferralCode: existingUser?.company?.referral?.code,
          },
        }),
        database.company.updateMany({
          data: {
            createdFromReferralCode: null,
          },
          where: {
            createdFromReferralCode: existingUser?.company?.referral?.code,
          },
        }),
      );
    }

    await database.$transaction(queries);

    const resultUpdatedUser = await database.user.update({
      data: {
        companyId: null,
        role: E_RolesServer.USER,
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
        workerSettings: {
          select: {
            permissions: true,
          },
        },
      },
      where: {
        id: userId,
      },
    });

    const imagesToDelete = (avatarWorkers ?? [])
      .filter(item => item.avatar !== null)
      .map(item => item.avatar ?? "");

    if (existingUser.company.avatar) {
      imagesToDelete.push(existingUser.company.avatar);
    }

    if (existingUser.company.bannerHero) {
      imagesToDelete.push(existingUser.company.bannerHero);
    }

    if (imagesToDelete.length > 0) {
      await manageFilesInStorage({
        delete: imagesToDelete,
        folder: null,
        type: null,
      });
    }

    await database.company.delete({
      where: {
        id: userCompanyId,
      },
    });

    const promises: Promise<unknown>[] = [];

    if (existingUser?.company?.stripe?.customerId) {
      promises.push(
        stripe.customers.del(existingUser.company.stripe.customerId),
      );
    }

    if (existingUser?.company?.stripe?.accountId) {
      promises.push(stripe.accounts.del(existingUser.company.stripe.accountId));
    }

    await Promise.all(promises);

    return createUserSession({
      flashData: {
        message: "successDeleteCompany",
        messageStatus: "success",
        refetchUserSession: true,
      },
      redirectPath: getRoute({
        route: E_Routes.account,
      }),
      request,
      userCompanyId: resultUpdatedUser?.company?.id ?? null,
      userCompanyName: resultUpdatedUser?.company?.name ?? null,
      userEmailVerification: resultUpdatedUser.emailVerification,
      userFirstName: resultUpdatedUser.firstName,
      userId: resultUpdatedUser.id,
      userLang: resultUpdatedUser.lang,
      userLastName: resultUpdatedUser.lastName,
      userPhoneVerification: resultUpdatedUser.phone,
      userRole: resultUpdatedUser.role,
      userSessionVersion: resultUpdatedUser.sessionVersion,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

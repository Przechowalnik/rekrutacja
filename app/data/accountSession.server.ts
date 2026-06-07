import dayjs from "dayjs";

import { database } from "~/data/database.server";

import { destroyUserSession, getUserFromSession } from "./authSession.server";
import { isEnableCreateOrLoginCompanyServer } from "./flags.server";
import { E_ListingPaymentStatusServer } from "./models.server";
import { prismaSelectUserSession } from "./prismaSelect.server";
import { responseOnSuccess } from "./response.server";

export const getUserSession = async ({ request }: { request: Request }) => {
  try {
    const {
      expiresAt,
      forceFetchUserData,
      userCompanyId,
      userCompanyName,
      userFirstName,
      userId,
      userLang,
      userLastName,
      userRole,
      userSessionVersion,
    } = await getUserFromSession({
      request,
    });

    if (!userId) {
      return await responseOnSuccess({
        request,
        status: 200,
      });
    }

    if (!isEnableCreateOrLoginCompanyServer() && userCompanyId) {
      return await destroyUserSession({
        request,
        status: 401,
        withRedirect: true,
      });
    }

    return await responseOnSuccess({
      data: {
        userCookie: {
          expiresAt,
          forceFetchUserData,
          userCompanyId,
          userCompanyName,
          userFirstName,
          userId,
          userLang,
          userLastName,
          userRole,
          userSessionVersion,
        },
      },
      request,
    });
  } catch {
    return await destroyUserSession({
      request,
      status: 401,
      withRedirect: true,
    });
  }
};

export const getDataFromSession = async ({ request }: { request: Request }) => {
  try {
    const {
      expiresAt,
      forceFetchUserData,
      userCompanyId,
      userCompanyName,
      userFirstName,
      userId,
      userLang,
      userLastName,
      userRole,
      userSessionVersion,
    } = await getUserFromSession({
      request,
    });

    if (!userId) {
      return await destroyUserSession({
        request,
        status: 401,
        withRedirect: true,
      });
    }

    const user = await database.user.findUnique({
      select: prismaSelectUserSession,
      where: {
        id: userId,
      },
    });

    if (!user) {
      return await destroyUserSession({
        request,
        status: 401,
        withRedirect: true,
      });
    }

    if (user.sessionVersion !== userSessionVersion) {
      return await destroyUserSession({
        message: "sessionExpired",
        request,
        status: 401,
        withRedirect: true,
      });
    }

    if (user.blockedAt) {
      return await destroyUserSession({
        request,
        status: 401,
        withRedirect: true,
      });
    }

    if (!isEnableCreateOrLoginCompanyServer() && user?.company) {
      return await destroyUserSession({
        request,
        status: 401,
        withRedirect: true,
      });
    }

    const startDateToSearch = dayjs().startOf("month").toDate();
    const endDateToSearch = dayjs().endOf("month").toDate();

    const countActiveCompanyListingsInMonth = user?.company?.id
      ? await database.listingPayment.count({
          where: {
            createdAt: {
              gte: startDateToSearch,
              lte: endDateToSearch,
            },
            listing: {
              companyId: user?.company?.id,
            },
            status: E_ListingPaymentStatusServer.FREE,
          },
        })
      : undefined;

    return await responseOnSuccess({
      data: {
        userCookie: {
          expiresAt,
          forceFetchUserData,
          userCompanyId,
          userCompanyName,
          userFirstName,
          userId,
          userLang,
          userLastName,
          userRole,
          userSessionVersion,
        },
        userSession: user ?? undefined,
        userSessionCompanyListingsInCurrentMonth:
          countActiveCompanyListingsInMonth,
      },
      request,
    });
  } catch {
    return await destroyUserSession({
      request,
      status: 401,
      withRedirect: true,
    });
  }
};

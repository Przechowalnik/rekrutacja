import dayjs from "dayjs";

import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { getCookieValue, getLastIdCookieName } from "./cookies.server";
import {
  E_ListingPaymentStatusServer,
  E_ListingStatusServer,
} from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectListings } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

const FREE_LISTING_DURATION_MONTHS = 1;

export const getListingsCompany = async ({
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
  const redirectOnError = await responseGetOnFailure({ request });
  if (!userCompanyId) {
    return redirectOnError;
  }

  const resultValidator = await checkZodValidator({
    queryData: [formNames.limit, formNames.page, formNames.listingStatus],
    request,
    validator: {
      [formNames.limit]: zodValidator.limit.optional(),
      [formNames.listingStatus]: zodValidator.listingStatus.optional(),
      [formNames.page]: zodValidator.page.optional(),
    },
  });

  if (resultValidator?.responseError) {
    return redirectOnError;
  }

  if (!resultValidator?.data) {
    return redirectOnError;
  }

  const {
    limit = 10,
    listingStatus = E_ListingStatusServer.ACTIVE,
    page = 1,
  } = resultValidator.data;

  const lastId = getCookieValue(
    request.headers.get("cookie"),
    getLastIdCookieName(request),
  );
  const skip = (page - 1) * limit;

  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: true,
      prismaArguments: {
        select: {
          company: {
            select: {
              phone: {
                select: {
                  countryCode: true,
                  number: true,
                  verifiedAt: true,
                },
              },
            },
          },
        },
        where: {
          companyId: userCompanyId,
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

    if (
      !existingUser?.company?.phone?.verifiedAt ||
      !existingUser?.company?.phone?.number ||
      !existingUser?.company?.phone?.countryCode
    ) {
      return redirectOnError;
    }

    const searchListings =
      listingStatus === E_ListingStatusServer.EXPIRED
        ? {
            OR: [
              {
                companyId: existingUser.company?.id,
                status: {
                  equals: listingStatus,
                  not: E_ListingStatusServer.DELETED,
                },
              },
              {
                companyId: existingUser.company?.id,
                expiresAt: {
                  lte: dayjs().toDate(),
                },
                status: {
                  equals: E_ListingStatusServer.ACTIVE,
                  not: E_ListingStatusServer.DELETED,
                },
              },
            ],
          }
        : {
            companyId: existingUser.company?.id,
            ...(listingStatus === E_ListingStatusServer.ACTIVE
              ? {
                  expiresAt: {
                    gt: dayjs().toDate(),
                  },
                }
              : {}),
            status: {
              equals: listingStatus,
            },
          };

    let cursorId: null | string = null;

    if (lastId) {
      const exists = await database.listing.findFirst({
        select: { id: true },
        where: { id: lastId, ...searchListings },
      });

      cursorId = exists ? lastId : null;
    }

    const listings = await database.listing.findMany({
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : { skip }),
      orderBy: [{ expiresAt: "desc" }, { id: "desc" }],
      select: prismaSelectListings,
      take: limit,
      where: searchListings,
    });

    const total = await database.listing.count({
      where: searchListings,
    });

    const nextPage = skip + limit < total ? page + 1 : null;
    const totalPages = Math.ceil(total / limit);

    return await responseOnSuccess({
      data: {
        listings,
        nextPage,
        totalPages,
        totalResults: total,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const extendListingCompany = async ({
  isCompany,
  listingIdOrSlug,
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  isCompany: boolean;
  listingIdOrSlug: null | string | undefined;
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    if ((!userCompanyId && isCompany) || !listingIdOrSlug) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.listingId]: zodValidator.listingId,
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
      company: isCompany,
      prismaArguments: {
        select: {
          company: {
            select: {
              id: true,
              phone: {
                select: {
                  verifiedAt: true,
                },
              },
            },
          },
          phone: {
            select: {
              verifiedAt: true,
            },
          },
        },
        where: {
          companyId: userCompanyId,
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

    if (isCompany) {
      if (!existingUser?.company?.phone?.verifiedAt) {
        return await responseOnFailure({
          message: "noActivePhoneNumberCompany",
          request,
          status: 422,
        });
      }
    } else if (!existingUser?.phone?.verifiedAt) {
      return await responseOnFailure({
        message: "noActivePhoneNumber",
        request,
        status: 422,
      });
    }

    const foundListing = await database.listing.findFirst({
      select: {
        expiresAt: true,
        id: true,
      },
      where: {
        OR: [{ slug: listingIdOrSlug }, { id: listingIdOrSlug }],
        ...(isCompany
          ? {
              companyId: existingUser.company.id,
            }
          : {
              userId: existingUser.id,
            }),
      },
    });

    if (!foundListing) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }
    if (isCompany && !existingUser?.company) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const validDateToNewDateExpiresAt = foundListing?.expiresAt
      ? dayjs(foundListing.expiresAt)
      : dayjs();

    const newDateExpiresAt = validDateToNewDateExpiresAt
      .add(FREE_LISTING_DURATION_MONTHS, "month")
      .add(1, "day")
      .toDate();

    await database.listingPayment.create({
      data: {
        expiresAtAfterAdd: newDateExpiresAt,
        expiresAtBeforeAdd: foundListing?.expiresAt,
        free: true,
        listingId: foundListing.id,
        monthsToAdd: FREE_LISTING_DURATION_MONTHS,
        status: E_ListingPaymentStatusServer.FREE,
      },
    });

    await database.listing.update({
      data: {
        expiresAt: newDateExpiresAt,
        status: E_ListingStatusServer.ACTIVE,
      },
      where: {
        id: foundListing.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successExtendCompanyListing",
        refetchUserSession: true,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

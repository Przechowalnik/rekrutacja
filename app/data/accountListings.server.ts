import dayjs from "dayjs";

import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { getCookieValue, getLastIdCookieName } from "./cookies.server";
import { E_ListingStatusServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectListings } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getListingsAccount = async ({
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

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      prismaArguments: {
        select: {
          phone: {
            select: {
              countryCode: true,
              number: true,
              verifiedAt: true,
            },
          },
        },
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

    const searchListings =
      listingStatus === E_ListingStatusServer.EXPIRED
        ? {
            OR: [
              {
                status: {
                  equals: listingStatus,
                  not: E_ListingStatusServer.DELETED,
                },
                userId: existingUser.id,
              },
              {
                expiresAt: {
                  lte: dayjs().toDate(),
                },
                status: {
                  equals: E_ListingStatusServer.ACTIVE,
                  not: E_ListingStatusServer.DELETED,
                },
                userId: existingUser.id,
              },
            ],
          }
        : {
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
            userId: existingUser.id,
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

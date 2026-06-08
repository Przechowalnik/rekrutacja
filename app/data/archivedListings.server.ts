import dayjs from "dayjs";

import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { E_ListingStatusServer } from "./models.server";
import { prismaSelectListings } from "./prismaSelect.server";
import { responseGetOnFailure, responseOnSuccess } from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

const LIMIT = 10;

export const getArchivedListings = async ({
  request,
}: {
  request: Request;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const resultValidator = await checkZodValidator({
      queryData: [formNames.page],
      request,
      validator: {
        [formNames.page]: zodValidator.page.optional(),
      },
    });

    if (resultValidator?.responseError || !resultValidator?.data) {
      return redirectOnError;
    }

    const { page = 1 } = resultValidator.data;
    const skip = (page - 1) * LIMIT;
    const now = dayjs().toDate();

    const where = {
      NOT: {
        expiresAt: { gt: now },
        status: E_ListingStatusServer.ACTIVE,
      },
      status: {
        notIn: [
          E_ListingStatusServer.DELETED,
          E_ListingStatusServer.REJECTED,
          E_ListingStatusServer.UNPAID,
        ],
      },
    };

    const [listings, total] = await Promise.all([
      database.listing.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: prismaSelectListings,
        skip,
        take: LIMIT,
        where,
      }),
      database.listing.count({ where }),
    ]);

    const totalPages = Math.ceil(total / LIMIT);

    return await responseOnSuccess({
      data: {
        listings,
        page,
        totalPages,
        totalResults: total,
      },
      request,
      status: 200,
    });
  } catch {
    return redirectOnError;
  }
};

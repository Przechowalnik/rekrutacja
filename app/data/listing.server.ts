import dayjs from "dayjs";

import { database } from "~/data/database.server";
import { serializeBigInt } from "~/utilities/converter";

import { cacheTimeServer } from "./cacheTime.server";
import { getEncryptedIp } from "./ip.server";
import {
  E_ListingInteractionTypeServer,
  E_ListingStatusServer,
} from "./models.server";
import { prismaSelectListing } from "./prismaSelect.server";
import { client } from "./redis.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
  throwNotFound,
} from "./response.server";

export const getListing = async ({
  listingIdOrSlug,
  request,
}: {
  listingIdOrSlug: null | string | undefined;
  request: Request;
}) => {
  if (!listingIdOrSlug) {
    throwNotFound();
  }

  try {
    const key = `listing:${listingIdOrSlug}`;
    const cached = await client.get(key);
    const cachedListing = (cached as { listing?: unknown } | null)?.listing;

    if (cachedListing) {
      return await responseOnSuccess({
        cacheResponse: {
          maxAge: cacheTimeServer.listing,
        },
        data: cached as never,
        extraHeaders: {
          "Cache-Control": "no-store",
          "X-Cache": "HIT",
        },
        request,
        status: 200,
      });
    }

    const currentDate = dayjs().toDate();

    const foundListing = await database.listing.findFirst({
      select: prismaSelectListing,
      where: {
        AND: [
          { OR: [{ slug: listingIdOrSlug }, { id: listingIdOrSlug }] },
          { OR: [{ availableTo: null }, { availableTo: { gt: currentDate } }] },
        ],
        expiresAt: {
          gt: currentDate,
        },
        status: E_ListingStatusServer.ACTIVE,
      },
    });

    if (!foundListing) {
      throwNotFound();
    }

    const result = {
      listing: foundListing,
    };

    await client.set(key, serializeBigInt(result), {
      ex: cacheTimeServer.listing,
    });

    return await responseOnSuccess({
      cacheResponse: {
        maxAge: cacheTimeServer.listing,
      },
      data: result,
      extraHeaders: {
        "Cache-Control": "no-store",
        "X-Cache": "MISS",
      },
      request,
      status: 200,
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error(error);
    throwNotFound();
  }
};

export const incrementListing = async ({
  listingIdOrSlug,
  request,
  type,
  userId,
}: {
  listingIdOrSlug: null | string | undefined;
  request: Request;
  type: keyof typeof E_ListingInteractionTypeServer;
  userId: null | string | undefined;
}) => {
  if (!listingIdOrSlug) {
    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
      status: 422,
    });
  }

  try {
    const foundListing = await database.listing.findFirst({
      select: { companyId: true, id: true, userId: true },
      where: { OR: [{ slug: listingIdOrSlug }, { id: listingIdOrSlug }] },
    });

    if (!foundListing) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 404,
      });
    }

    if (userId) {
      if (foundListing.userId === userId) {
        return await responseOnSuccess({ request, status: 204 });
      }

      const since = dayjs().subtract(24, "hour").toDate();

      const exists = await database.listingInteraction.findFirst({
        select: { id: true },
        where: {
          createdAt: {
            gte: since,
          },
          listingId: foundListing.id,
          type,
          userId,
        },
      });

      if (exists) {
        return await responseOnSuccess({ request, status: 204 });
      }

      await database.listingInteraction.create({
        data: {
          listingId: foundListing.id,
          ownerCompanyId: foundListing.companyId,
          ownerUserId: foundListing.userId,
          type,
          userId,
        },
      });

      return await responseOnSuccess({ request, status: 200 });
    }

    const encryptedIp = getEncryptedIp({ request });
    const key = `listing:${listingIdOrSlug},ip:${encryptedIp},type:${type}`;

    const cached = await client.get(key);
    if (cached) {
      return await responseOnSuccess({ request, status: 204 });
    }

    await database.listingInteraction.create({
      data: {
        listingId: foundListing.id,
        ownerCompanyId: foundListing.companyId,
        ownerUserId: foundListing.userId,
        type,
      },
    });

    await client.set(key, serializeBigInt(true), {
      ex: cacheTimeServer.listingContactInteraction,
    });

    return await responseOnSuccess({ request, status: 200 });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

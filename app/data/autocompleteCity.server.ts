import { formNames } from "~/lib/zodFormValidator";
import { serializeBigInt } from "~/utilities/converter";

import { cacheTimeServer } from "./cacheTime.server";
import { database } from "./database.server";
import { normalizeSearch } from "./functions.server";
import { prismaSelectCities } from "./prismaSelect.server";
import { client } from "./redis.server";
import { responseOnFailureServer, responseOnSuccess } from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const postCityAutocomplete = async ({
  request,
}: {
  request: Request;
}) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.listingCity]: zodValidator.listingCity,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnSuccess({
        data: [],
        extraHeaders: {
          "Cache-Control": "no-store",
        },
        request,
        status: 200,
      });
    }

    if (!resultValidator?.data) {
      return await responseOnSuccess({
        data: [],
        extraHeaders: {
          "Cache-Control": "no-store",
        },
        request,
        status: 200,
      });
    }

    const { listingCity } = resultValidator.data;

    if (listingCity.length < 3) {
      return await responseOnSuccess({
        data: [],
        extraHeaders: {
          "Cache-Control": "no-store",
        },
        request,
        status: 200,
      });
    }

    const citySearch = normalizeSearch(listingCity);
    const key = `cities:${citySearch}`;
    const cached = await client.get(key);

    if (cached) {
      return await responseOnSuccess({
        data: cached,
        extraHeaders: {
          "Cache-Control": "no-store",
          "X-Cache": "HIT",
        },
        request,
        status: 200,
      });
    }

    const cities = await database.city.findMany({
      select: prismaSelectCities,
      take: 20,
      where: {
        nameSearch: {
          contains: citySearch,
        },
      },
    });

    const result = {
      cities,
    };

    await client.set(key, serializeBigInt(result), {
      ex: cacheTimeServer.autocomplete,
    });

    return await responseOnSuccess({
      data: result,
      extraHeaders: {
        "Cache-Control": "no-store",
        "X-Cache": "MISS",
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

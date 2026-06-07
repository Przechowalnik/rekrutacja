import { formNames } from "~/lib/zodFormValidator";
import { serializeBigInt } from "~/utilities/converter";

import { cacheTimeServer } from "./cacheTime.server";
import { database } from "./database.server";
import { environment } from "./environment.server";
import { extractApartmentNumber, normalizeSearch } from "./functions.server";
import { E_CountryServer } from "./models.server";
import { prismaSelectCity } from "./prismaSelect.server";
import { client } from "./redis.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const postAutocomplete = async ({ request }: { request: Request }) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.autocompleteAddress]: zodValidator.autocompleteAddress,
        [formNames.autocompleteSessionToken]:
          zodValidator.autocompleteSessionToken,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data || !environment("GOOGLE_MAPS_KEY")) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { autocompleteAddress, autocompleteSessionToken } =
      resultValidator.data;

    if (autocompleteAddress.length < 5) {
      return await responseOnSuccess({
        data: [],
        extraHeaders: {
          "Cache-Control": "no-store",
        },
        request,
        status: 200,
      });
    }

    const key = `autocomplete:${autocompleteAddress?.toLowerCase()}`;
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

    const resource = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        body: JSON.stringify({
          includedPrimaryTypes: ["street_address", "premise", "subpremise"],
          input: autocompleteAddress,
          languageCode: "pl",
          regionCode: "PL",
          sessionToken: autocompleteSessionToken,
        }),
        headers: {
          "X-Goog-Api-Key": environment("GOOGLE_MAPS_KEY"),
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
        },
        method: "POST",
      },
    );

    let placeSuggestions = [];

    if (resource.ok) {
      const data = await resource.json();
      const newSuggestions =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.suggestions?.map((s: any) => ({
          description: s.placePrediction.text.text,
          id: s.placePrediction.placeId,
        })) || [];

      placeSuggestions = newSuggestions;
    } else {
      console.error("Error on autocomplete:", await resource.text());
      placeSuggestions = [];
    }

    const result = {
      autocompletePlaceSuggestions: placeSuggestions,
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

export const getPlaceAutocomplete = async ({
  request,
}: {
  request: Request;
}) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.autocompletePlaceId]: zodValidator.autocompletePlaceId,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data || !environment("GOOGLE_MAPS_KEY")) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { autocompletePlaceId } = resultValidator.data;

    const key = `autocompletePlaceDetails:${autocompletePlaceId}`;
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

    const resource = await fetch(
      `https://places.googleapis.com/v1/places/${autocompletePlaceId}?languageCode=en&regionCode=PL`,
      {
        headers: {
          "Accept-Language": "pl",
          "X-Goog-Api-Key": environment("GOOGLE_MAPS_KEY"),
          "X-Goog-FieldMask": "formattedAddress,addressComponents",
        },
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let place: any = null;

    if (resource.ok) {
      const data = await resource.json();
      place = data ?? null;
    } else {
      console.error("Error on autocomplete:", await resource.text());
      place = null;
    }

    const get = (type: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      place?.addressComponents?.find((c: any) => c.types.includes(type))
        ?.longText ?? "";

    const district =
      get("sublocality_level_1") ||
      get("sublocality") ||
      get("neighborhood") ||
      get("administrative_area_level_3");

    const apartment = extractApartmentNumber(place.formattedAddress);

    const city = (get("locality") || get("postal_town")) as string;

    const country = get("country").toUpperCase() as string;

    if (country !== E_CountryServer.POLAND) {
      return await responseOnSuccess({
        request,
        status: 200,
      });
    }

    const foundCity = city
      ? await database.city.findUnique({
          select: prismaSelectCity,
          where: {
            nameSearch: normalizeSearch(city?.toLowerCase()),
          },
        })
      : null;

    const foundDistrict =
      district && city
        ? foundCity?.districts?.find(
            item =>
              item.nameSearch === normalizeSearch(district?.toLowerCase()),
          )
        : null;

    const autocompletePlace = {
      city: foundCity?.name ?? city,
      cityWithDistricts: foundCity,
      country,
      district: (foundDistrict?.name ?? (district || null)) as null | string,
      flatNumber: apartment ?? null,
      full: place.formattedAddress as string,
      postalCode: get("postal_code") as string,
      street: get("route") as string,
      streetNumber: get("street_number") as string,
    };

    const result = {
      autocompletePlace,
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

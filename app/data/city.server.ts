import { T_City } from "~/models/city";
import { T_CityDistrict } from "~/models/cityNested";
import { T_LocationRadius } from "~/models/enums";
import { serializeBigInt } from "~/utilities/converter";

import { cacheTimeServer } from "./cacheTime.server";
import { database } from "./database.server";
import { environment } from "./environment.server";
import {
  boundingBoxKm,
  haversineKm,
  normalizeSearch,
} from "./functions.server";
import { prismaSelectCities, prismaSelectCity } from "./prismaSelect.server";
import { client } from "./redis.server";
import { T_ResponseOnFailure } from "./response.server";

type T_FindNearestCityWithinRadiusResult = {
  city: T_City;
  coverageKm: number;
  distanceToCenterKm: number;
} | null;

export async function findNearestCityWithinRadius({
  extraRadius = 30,
  location,
  maxCityRadius = 20,
}: {
  extraRadius?: T_LocationRadius;
  location: { lat: number; lng: number };
  maxCityRadius?: number;
}): Promise<T_FindNearestCityWithinRadiusResult> {
  const box = boundingBoxKm({
    location,
    radiusKm: maxCityRadius + extraRadius,
  });

  const candidates = await database.city.findMany({
    select: prismaSelectCities,
    where: {
      lat: { gte: box.minLat, lte: box.maxLat },
      lng: { gte: box.minLng, lte: box.maxLng },
    },
  });

  if (candidates.length === 0) {
    return null;
  }

  let best: {
    city: (typeof candidates)[number];
    coverageKm: number;
    distanceToCenterKm: number;
  } | null = null;

  for (const city of candidates) {
    const distanceToCenterKm = haversineKm({
      city: { lat: city.lat, lng: city.lng },
      locationToCheck: location,
    });

    const coverageKm = city.radiusKm + extraRadius;

    if (distanceToCenterKm > coverageKm) {
      continue;
    }

    if (!best || distanceToCenterKm < best.distanceToCenterKm) {
      best = { city, coverageKm, distanceToCenterKm };
    }
  }

  return best;
}

export async function getCityFromNameSearch({
  nameSearch,
}: {
  nameSearch: string;
}): Promise<null | T_City> {
  const key = `city:${nameSearch}`;
  const cached = await client.get<{
    city: T_City;
  }>(key);

  if (cached?.city) {
    return cached?.city;
  }

  const foundCity = await database.city.findUnique({
    select: prismaSelectCity,
    where: { nameSearch: nameSearch?.toLowerCase() },
  });

  if (!foundCity) {
    return null;
  }

  const result = {
    city: foundCity,
  };

  await client.set(key, serializeBigInt(result), {
    ex: cacheTimeServer.city,
  });

  return foundCity;
}

export const getAllCitiesToSitemap = async () => {
  try {
    if (environment("LOCAL_ENV")?.toLowerCase() === "dev") {
      return [];
    }

    const cities = await database.city.findMany({
      orderBy: {
        name: "desc",
      },
      select: {
        nameSearch: true,
      },
    });

    return cities.map(item => item.nameSearch);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export type T_CheckListingCityResult = {
  city?: T_City;
  cityCustom?: string;
  district?: T_CityDistrict;
  responseError?: T_ResponseOnFailure;
};

export const checkListingCityWithDistrictAndNearestCity = async ({
  listingCity,
  listingDistrict,
  listingGeolocation,
  request,
}: {
  listingCity: string;
  listingDistrict: null | string | undefined;
  listingGeolocation: {
    address: string;
    lat: number;
    lng: number;
  };
  request: Request;
}): Promise<T_CheckListingCityResult> => {
  const normalizedListingCity = normalizeSearch(listingCity);
  const foundCityInDatabase = await getCityFromNameSearch({
    nameSearch: normalizedListingCity,
  });

  if (foundCityInDatabase) {
    if (
      foundCityInDatabase?.districts &&
      foundCityInDatabase?.districts?.length > 0
    ) {
      if (listingDistrict) {
        const foundDistrict = foundCityInDatabase.districts.find(
          item => item.nameSearch === normalizeSearch(listingDistrict),
        );

        if (!foundDistrict) {
          return {
            responseError: {
              message: "districtNotFound",
              request,
              status: 422,
            },
          };
        }

        return {
          city: foundCityInDatabase,
          district: foundDistrict,
        };
      } else {
        return {
          responseError: {
            message: "districtMissing",
            request,
            status: 422,
          },
        };
      }
    } else if (listingDistrict) {
      return {
        responseError: {
          message: "districtNotFound",
          request,
          status: 422,
        },
      };
    } else {
      return {
        city: foundCityInDatabase,
      };
    }
  } else {
    const nearestCity = await findNearestCityWithinRadius({
      location: listingGeolocation,
    });

    if (!nearestCity) {
      return {
        responseError: {
          message: "locationOverMaxArea",
          request,
          status: 422,
        },
      };
    }

    const isSameCityAsNearest =
      nearestCity.city.nameSearch === normalizedListingCity;

    return {
      city: nearestCity.city,
      cityCustom: isSameCityAsNearest ? undefined : listingCity,
    };
  }
};

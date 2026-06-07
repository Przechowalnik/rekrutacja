import dayjs from "dayjs";

import { T_CategoryCityCounts } from "~/models/categoryCityCounts";
import { T_CityCategoryCounts } from "~/models/cityCategoryCounts";

import { cacheTimeServer } from "./cacheTime.server";
import { database } from "./database.server";
import {
  E_ListingStatusServer,
  T_ListingCategoryServer,
} from "./models.server";
import { client } from "./redis.server";

const CACHE_KEY_CITY_TOTALS = "cityTotals:active";
const CACHE_KEY_CITY = (cityId: string) => `cityCounts:${cityId}`;
const CACHE_KEY_CATEGORY_CITIES = (category: string) =>
  `categoryCityCounts:${category}`;

export type T_ActiveCityTotals = Record<string, number>;

export const getActiveCityTotals = async (): Promise<T_ActiveCityTotals> => {
  try {
    const cached = await client.get<T_ActiveCityTotals>(CACHE_KEY_CITY_TOTALS);
    if (cached) {
      return cached;
    }

    const now = dayjs().toDate();

    const grouped = await database.listingLocation.groupBy({
      _count: { _all: true },
      by: ["cityId"],
      where: {
        cityId: { not: null },
        listing: {
          expiresAt: { gt: now },
          status: E_ListingStatusServer.ACTIVE,
        },
      },
    });

    const result: T_ActiveCityTotals = {};
    for (const row of grouped) {
      if (row.cityId) {
        result[row.cityId] = row._count._all;
      }
    }

    await client.set(CACHE_KEY_CITY_TOTALS, result, {
      ex: cacheTimeServer.city,
    });

    return result;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const getCityListingCountsByCategory = async ({
  cityId,
}: {
  cityId: string;
}): Promise<T_CityCategoryCounts> => {
  try {
    const cached = await client.get<T_CityCategoryCounts>(
      CACHE_KEY_CITY(cityId),
    );
    if (cached) {
      return cached;
    }

    const now = dayjs().toDate();

    const grouped = await database.listing.groupBy({
      _count: { _all: true },
      by: ["category"],
      where: {
        expiresAt: { gt: now },
        location: { is: { cityId } },
        status: E_ListingStatusServer.ACTIVE,
      },
    });

    const result: T_CityCategoryCounts = { byCategory: {}, total: 0 };
    for (const group of grouped) {
      const count = group._count._all;
      result.byCategory[group.category] = count;
      result.total += count;
    }

    await client.set(CACHE_KEY_CITY(cityId), result, {
      ex: cacheTimeServer.listing,
    });

    return result;
  } catch (error) {
    console.error(error);
    return { byCategory: {}, total: 0 };
  }
};

export const getCategoryCityCounts = async ({
  category,
}: {
  category: T_ListingCategoryServer;
}): Promise<T_CategoryCityCounts> => {
  try {
    const cached = await client.get<T_CategoryCityCounts>(
      CACHE_KEY_CATEGORY_CITIES(category),
    );
    if (cached) {
      return cached;
    }

    const now = dayjs().toDate();

    const grouped = await database.listingLocation.groupBy({
      _count: { _all: true },
      by: ["cityId"],
      where: {
        cityId: { not: null },
        listing: {
          category,
          expiresAt: { gt: now },
          status: E_ListingStatusServer.ACTIVE,
        },
      },
    });

    const result: T_CategoryCityCounts = {};
    for (const row of grouped) {
      if (row.cityId) {
        result[row.cityId] = row._count._all;
      }
    }

    await client.set(CACHE_KEY_CATEGORY_CITIES(category), result, {
      ex: cacheTimeServer.listing,
    });

    return result;
  } catch (error) {
    console.error(error);
    return {};
  }
};

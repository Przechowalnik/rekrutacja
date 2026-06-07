import { createHash } from "node:crypto";

import dayjs from "dayjs";
import z from "zod";

import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";
import { T_City } from "~/models/city";
import {
  T_CityDistrict,
  T_CityDistrictName,
  T_CityName,
} from "~/models/cityNested";
import { T_LocationRadius } from "~/models/enums";
import { serializeBigInt } from "~/utilities/converter";

import { getUserFromSession } from "./authSession.server";
import { cacheTimeServer } from "./cacheTime.server";
import { getCityFromNameSearch } from "./city.server";
import { getCookieValue, getLastIdCookieName } from "./cookies.server";
import { omitNested } from "./date.server";
import { boundingBoxKm } from "./functions.server";
import {
  getActiveCityTotals,
  getCategoryCityCounts,
  getCityListingCountsByCategory,
} from "./listingCounts.server";
import { fireMetaSearchEvent, T_MetaCapiUserData } from "./metaCapi.server";
import {
  E_ListingCategoryServer,
  E_ListingContractTypeServer,
  E_ListingStatusServer,
  E_ListingTypeServer,
  T_ListingCategoryServer,
} from "./models.server";
import {
  prismaSelectCity,
  prismaSelectListings,
  prismaSelectListingsMap,
} from "./prismaSelect.server";
import { client } from "./redis.server";
import {
  responseGetOnFailure,
  responseOnSuccess,
  throwNotFound,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getListingsSearch = async ({
  listingCategory,
  listingCity,
  listingCityDistrict,
  request,
}: {
  listingCategory: null | T_ListingCategoryServer | undefined;
  listingCity: null | T_CityName | undefined;
  listingCityDistrict: null | T_CityDistrictName | undefined;
  request: Request;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  if (!listingCategory) {
    throwNotFound();
  }

  const resultZodListingCategory = await z
    .object({
      listingCategory: z.nativeEnum(E_ListingCategoryServer, {}),
    })
    .safeParseAsync({ listingCategory });

  if (resultZodListingCategory.error) {
    throwNotFound();
  }

  if (!listingCity) {
    throwNotFound();
  }

  const resultZod = await zodValidator.listingCity.safeParseAsync(listingCity);
  if (resultZod.error) {
    throwNotFound();
  }

  try {
    const sessionUser = await getUserFromSession({ request });
    const metaUserData: T_MetaCapiUserData | undefined = sessionUser.userId
      ? {
          externalId: sessionUser.userId,
          ...(sessionUser.userFirstName
            ? { firstName: sessionUser.userFirstName }
            : {}),
          ...(sessionUser.userLastName
            ? { lastName: sessionUser.userLastName }
            : {}),
        }
      : undefined;

    const resultValidator = await checkZodValidator({
      arrayData: [
        formNames.listingParkingTypes,
        formNames.listingContainerTypes,
        formNames.listingPlotTypes,
        formNames.listingUnitTypes,
      ],
      queryData: [
        formNames.limit,
        formNames.page,
        formNames.listingCondition,
        formNames.listingParkingTypes,
        formNames.listingContainerTypes,
        formNames.listingPlotTypes,
        formNames.listingUnitTypes,
        formNames.listingDistrict,
        formNames.listingDistrictId,
        formNames.listingCityId,
        formNames.listingAvailableFrom,
        formNames.listingType,
        formNames.listingContractType,
        formNames.listingAccess,
        formNames.listingRentalDays,
        formNames.checkboxListingShortTerm,
        formNames.checkboxListingLongTerm,
        formNames.locationRadius,
      ],
      request,
      validator: {
        [formNames.checkboxListingLongTerm]:
          zodValidator.checkboxQuery.optional(),
        [formNames.checkboxListingShortTerm]:
          zodValidator.checkboxQuery.optional(),
        [formNames.limit]: zodValidator.limit.optional(),
        [formNames.listingAccess]: zodValidator.listingAccess.optional(),
        [formNames.listingAvailableFrom]: zodValidator.date.optional(),
        [formNames.listingCityId]: zodValidator.listingCityId.optional(),
        [formNames.listingCondition]: zodValidator.listingCondition.optional(),
        [formNames.listingContainerTypes]: zodValidator.listingContainerType
          .array()
          .optional(),
        [formNames.listingContractType]:
          zodValidator.listingContractType.optional(),
        [formNames.listingDistrict]: zodValidator.listingDistrict.optional(),
        [formNames.listingDistrictId]:
          zodValidator.listingDistrictId.optional(),
        [formNames.listingParkingTypes]: zodValidator.listingParkingType
          .array()
          .optional(),
        [formNames.listingPlotTypes]: zodValidator.listingPlotType
          .array()
          .optional(),
        [formNames.listingRentalDays]:
          zodValidator.listingRentalDays.optional(),
        [formNames.listingType]: zodValidator.listingType.optional(),
        [formNames.listingUnitTypes]: zodValidator.listingUnitType
          .array()
          .optional(),
        [formNames.locationRadius]: zodValidator.locationRadius.optional(),
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
      checkboxListingLongTerm,
      checkboxListingShortTerm,
      limit = 10,
      listingAccess,
      listingAvailableFrom,
      listingCityId,
      listingCondition,
      listingContainerTypes = [],
      listingContractType,
      listingDistrict,
      listingDistrictId,
      listingParkingTypes = [],
      listingPlotTypes = [],
      listingRentalDays,
      listingType,
      listingUnitTypes = [],
      locationRadius,
      page = 1,
    } = resultValidator.data;

    const lastId = getCookieValue(
      request.headers.get("cookie"),
      getLastIdCookieName(request),
    );
    const skip = (page - 1) * limit;

    const now = dayjs().toDate();

    const foundCity = await getCityFromNameSearch({
      nameSearch: listingCity,
    });

    if (!foundCity) {
      throwNotFound();
    }

    const foundCityDistrict = listingCityDistrict
      ? foundCity?.districts?.find(
          item => item.nameSearch === listingCityDistrict,
        )
      : null;

    if (listingCityDistrict && !foundCityDistrict) {
      throwNotFound();
    }

    const { maxLat, maxLng, minLat, minLng } = locationRadius
      ? boundingBoxKm({
          location: foundCity,
          radiusKm: locationRadius as T_LocationRadius,
        })
      : { maxLat: null, maxLng: null, minLat: null, minLng: null };

    let resolvedDistrictId = listingDistrictId;
    if (!resolvedDistrictId && listingDistrict && foundCity.districts) {
      const foundDistrict = foundCity.districts.find(
        d => d.nameSearch === listingDistrict.toLowerCase(),
      );
      resolvedDistrictId = foundDistrict?.id;
    }

    let contractType = listingContractType;

    if (checkboxListingShortTerm) {
      contractType = E_ListingContractTypeServer.SHORT_TERM;
    } else if (checkboxListingLongTerm) {
      contractType = E_ListingContractTypeServer.LONG_TERM;
    }

    const searchListings = {
      category: listingCategory,
      expiresAt: {
        gt: now,
      },
      location: {
        is:
          locationRadius &&
          minLat !== null &&
          maxLat !== null &&
          minLng !== null &&
          maxLng !== null
            ? {
                lat: { gte: minLat, lte: maxLat },
                lng: { gte: minLng, lte: maxLng },
              }
            : {
                cityId: listingCityId ?? foundCity.id,
                ...(resolvedDistrictId
                  ? { districtId: resolvedDistrictId }
                  : {}),
              },
      },
      OR: [{ availableTo: null }, { availableTo: { gt: now } }],
      status: E_ListingStatusServer.ACTIVE,
      ...(listingCategory && listingCondition
        ? {
            condition: listingCondition,
          }
        : {}),
      ...(listingCategory === E_ListingCategoryServer.PARKING &&
      listingParkingTypes &&
      listingParkingTypes.length > 0
        ? {
            parkingType: {
              in: listingParkingTypes,
            },
          }
        : {}),
      ...(listingCategory === E_ListingCategoryServer.CONTAINER &&
      listingContainerTypes &&
      listingContainerTypes.length > 0
        ? {
            containerType: {
              in: listingContainerTypes,
            },
          }
        : {}),
      ...(listingCategory === E_ListingCategoryServer.PLOT &&
      listingPlotTypes &&
      listingPlotTypes.length > 0
        ? {
            plotType: {
              in: listingPlotTypes,
            },
          }
        : {}),
      ...(listingCategory === E_ListingCategoryServer.UNIT &&
      listingUnitTypes &&
      listingUnitTypes.length > 0
        ? {
            unitType: {
              in: listingUnitTypes,
            },
          }
        : {}),
      ...(listingAvailableFrom
        ? {
            availableFrom: {
              lte: listingAvailableFrom,
            },
          }
        : {}),
      ...(listingAccess
        ? {
            access: listingAccess,
          }
        : {}),
      ...((listingContractType ||
        checkboxListingShortTerm ||
        checkboxListingLongTerm) &&
      listingType === E_ListingTypeServer.RENT
        ? {
            contractType,
          }
        : {}),
      ...(listingType
        ? {
            type: listingType,
          }
        : {}),
      ...(listingType === E_ListingTypeServer.RENT && listingRentalDays
        ? {
            minimumRentalDays: {
              lte: listingRentalDays,
            },
          }
        : {}),
    };

    const redisFilters = {
      ...omitNested(searchListings, {
        expiresAt: false,
        OR: false,
      }),
      lastId,
      skip,
      take: limit,
    };

    const key =
      "listingsSearch:" +
      createHash("sha1").update(JSON.stringify(redisFilters)).digest("hex");
    const cached = await client.get(key);

    if (cached) {
      const cityCategoryCounts = await getCityListingCountsByCategory({
        cityId: foundCity.id,
      });

      const cachedTotal = (cached as { totalResults?: number })?.totalResults;
      fireMetaSearchEvent({
        category: listingCategory,
        city: foundCity.name,
        numResults: cachedTotal,
        request,
        userData: metaUserData,
      });

      return await responseOnSuccess({
        cacheResponse: {
          maxAge: cacheTimeServer.listing,
        },
        data: {
          ...(cached as object),
          cityCategoryCounts,
        },
        extraHeaders: {
          "Cache-Control": "no-store",
          "X-Cache": "HIT",
        },
        request,
        status: 200,
      });
    }

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
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: prismaSelectListings,
      take: limit,
      where: searchListings,
    });

    const total = await database.listing.count({
      where: searchListings,
    });

    const nextPage = skip + limit < total ? page + 1 : null;
    const totalPages = Math.ceil(total / limit);

    const result = {
      city: foundCity,
      district: foundCityDistrict,
      listings,
      nextPage,
      totalPages,
      totalResults: total,
    };

    await client.set(key, serializeBigInt(result), {
      ex: cacheTimeServer.listing,
    });

    const cityCategoryCounts = await getCityListingCountsByCategory({
      cityId: foundCity.id,
    });

    fireMetaSearchEvent({
      category: listingCategory,
      city: foundCity.name,
      numResults: total,
      request,
      userData: metaUserData,
    });

    return await responseOnSuccess({
      cacheResponse: {
        maxAge: cacheTimeServer.listing,
      },
      data: { ...result, cityCategoryCounts },
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
    return redirectOnError;
  }
};

export const getListingsMap = async ({ request }: { request: Request }) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const resultValidator = await checkZodValidator({
      arrayData: [
        formNames.listingParkingTypes,
        formNames.listingContainerTypes,
        formNames.listingPlotTypes,
        formNames.listingUnitTypes,
      ],
      queryData: [
        formNames.mapLocationEast,
        formNames.mapLocationNorth,
        formNames.mapLocationSouth,
        formNames.mapLocationWest,
        formNames.mapZoom,
        formNames.listingCategory,
        formNames.listingCondition,
        formNames.listingParkingTypes,
        formNames.listingContainerTypes,
        formNames.listingPlotTypes,
        formNames.listingUnitTypes,
        formNames.listingCity,
        formNames.listingCityId,
        formNames.listingDistrict,
        formNames.listingDistrictId,
        formNames.listingAvailableFrom,
        formNames.listingType,
        formNames.listingContractType,
        formNames.listingAccess,
        formNames.isMobile,
        formNames.listingRentalDays,
        formNames.checkboxListingShortTerm,
        formNames.checkboxListingLongTerm,
      ],
      request,
      validator: {
        [formNames.checkboxListingLongTerm]:
          zodValidator.checkboxQuery.optional(),
        [formNames.checkboxListingShortTerm]:
          zodValidator.checkboxQuery.optional(),
        [formNames.isMobile]: zodValidator.isMobileQuery,
        [formNames.listingAccess]: zodValidator.listingAccess.optional(),
        [formNames.listingAvailableFrom]: zodValidator.date.optional(),
        [formNames.listingCategory]: zodValidator.listingCategory,
        [formNames.listingCity]: zodValidator.listingCity,
        [formNames.listingCityId]: zodValidator.listingCityId.optional(),
        [formNames.listingCondition]: zodValidator.listingCondition.optional(),
        [formNames.listingContainerTypes]: zodValidator.listingContainerType
          .array()
          .optional(),
        [formNames.listingContractType]:
          zodValidator.listingContractType.optional(),
        [formNames.listingDistrict]: zodValidator.listingDistrict.optional(),
        [formNames.listingDistrictId]:
          zodValidator.listingDistrictId.optional(),
        [formNames.listingParkingTypes]: zodValidator.listingParkingType
          .array()
          .optional(),
        [formNames.listingPlotTypes]: zodValidator.listingPlotType
          .array()
          .optional(),
        [formNames.listingRentalDays]:
          zodValidator.listingRentalDays.optional(),
        [formNames.listingType]: zodValidator.listingType.optional(),
        [formNames.listingUnitTypes]: zodValidator.listingUnitType
          .array()
          .optional(),
        [formNames.mapLocationEast]: zodValidator.mapLocationEast,
        [formNames.mapLocationNorth]: zodValidator.mapLocationNorth,
        [formNames.mapLocationSouth]: zodValidator.mapLocationSouth,
        [formNames.mapLocationWest]: zodValidator.mapLocationWest,
        [formNames.mapZoom]: zodValidator.mapZoom,
      },
    });

    if (resultValidator?.responseError) {
      return redirectOnError;
    }

    if (!resultValidator?.data) {
      return redirectOnError;
    }

    const {
      checkboxListingLongTerm,
      checkboxListingShortTerm,
      isMobile,
      listingAccess,
      listingAvailableFrom,
      listingCategory,
      listingCity,
      listingCityId,
      listingCondition,
      listingContainerTypes = [],
      listingContractType,
      listingDistrict,
      listingDistrictId,
      listingParkingTypes = [],
      listingPlotTypes = [],
      listingRentalDays,
      listingType,
      listingUnitTypes = [],
      mapLocationEast,
      mapLocationNorth,
      mapLocationSouth,
      mapLocationWest,
      mapZoom,
    } = resultValidator.data;

    const readyToGetMarkers = isMobile ? mapZoom > 11 : mapZoom > 10;

    const now = dayjs().toDate();

    const foundCity = await getCityFromNameSearch({
      nameSearch: listingCity,
    });

    if (!foundCity) {
      return redirectOnError;
    }

    let resolvedDistrictIdMap = listingDistrictId;
    if (!resolvedDistrictIdMap && listingDistrict && foundCity.districts) {
      const foundDistrict = foundCity.districts.find(
        d => d.nameSearch === listingDistrict.toLowerCase(),
      );
      resolvedDistrictIdMap = foundDistrict?.id;
    }

    let contractType = listingContractType;

    if (checkboxListingShortTerm) {
      contractType = E_ListingContractTypeServer.SHORT_TERM;
    } else if (checkboxListingLongTerm) {
      contractType = E_ListingContractTypeServer.LONG_TERM;
    }

    const searchListingsMap = {
      category: listingCategory,
      expiresAt: {
        gt: now,
      },
      location: {
        is:
          mapLocationSouth &&
          mapLocationNorth &&
          mapLocationWest &&
          mapLocationEast
            ? {
                lat: {
                  gte: mapLocationSouth,
                  lte: mapLocationNorth,
                },
                lng: {
                  gte: mapLocationWest,
                  lte: mapLocationEast,
                },
              }
            : {
                cityId: listingCityId ?? foundCity.id,
                ...(resolvedDistrictIdMap
                  ? { districtId: resolvedDistrictIdMap }
                  : {}),
              },
      },
      OR: [{ availableTo: null }, { availableTo: { gt: now } }],
      ...(listingCategory && listingCondition
        ? {
            condition: listingCondition,
          }
        : {}),
      status: E_ListingStatusServer.ACTIVE,
      ...(listingCategory === E_ListingCategoryServer.PARKING &&
      listingParkingTypes &&
      listingParkingTypes.length > 0
        ? {
            parkingType: {
              in: listingParkingTypes,
            },
          }
        : {}),
      ...(listingCategory === E_ListingCategoryServer.CONTAINER &&
      listingContainerTypes &&
      listingContainerTypes.length > 0
        ? {
            containerType: {
              in: listingContainerTypes,
            },
          }
        : {}),
      ...(listingCategory === E_ListingCategoryServer.PLOT &&
      listingPlotTypes &&
      listingPlotTypes.length > 0
        ? {
            plotType: {
              in: listingPlotTypes,
            },
          }
        : {}),
      ...(listingCategory === E_ListingCategoryServer.UNIT &&
      listingUnitTypes &&
      listingUnitTypes.length > 0
        ? {
            unitType: {
              in: listingUnitTypes,
            },
          }
        : {}),
      ...(listingAvailableFrom
        ? {
            availableFrom: {
              lte: listingAvailableFrom,
            },
          }
        : {}),
      ...(listingAccess
        ? {
            access: listingAccess,
          }
        : {}),
      ...((listingContractType ||
        checkboxListingShortTerm ||
        checkboxListingLongTerm) &&
      listingType === E_ListingTypeServer.RENT
        ? {
            contractType,
          }
        : {}),
      ...(listingType
        ? {
            type: listingType,
          }
        : {}),
      ...(listingType === E_ListingTypeServer.RENT && listingRentalDays
        ? {
            minimumRentalDays: {
              lte: listingRentalDays,
            },
          }
        : {}),
    };

    const maxTakePoints = 500;

    const redisFilters = {
      ...omitNested(searchListingsMap, {
        expiresAt: false,
        OR: false,
      }),
      take: maxTakePoints,
    };

    const key =
      "listingsSearchMap:" +
      createHash("sha1").update(JSON.stringify(redisFilters)).digest("hex");
    const cached = await client.get(key);

    if (cached) {
      return await responseOnSuccess({
        cacheResponse: {
          maxAge: cacheTimeServer.listing,
        },
        data: cached,
        extraHeaders: {
          "Cache-Control": "no-store",
          "X-Cache": "HIT",
        },
        request,
        status: 200,
      });
    }

    const listingsMapCount = await database.listing.count({
      where: searchListingsMap,
    });

    const listingsMap = readyToGetMarkers
      ? await database.listing.findMany({
          orderBy: {
            createdAt: "desc",
          },
          select: prismaSelectListingsMap,
          take: maxTakePoints,
          where: searchListingsMap,
        })
      : [];

    const result = {
      listingsMap,
      listingsMapCount,
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
    console.error(error);
    return redirectOnError;
  }
};

export const getLatestListings = async ({ request }: { request: Request }) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const key = "listingsLatest";
    const cached = await client.get(key);

    if (cached) {
      return await responseOnSuccess({
        cacheResponse: {
          maxAge: cacheTimeServer.listing,
        },
        data: { ...(cached as object) },
        extraHeaders: {
          "Cache-Control": "no-store",
          "X-Cache": "HIT",
        },
        request,
        status: 200,
      });
    }

    const now = dayjs().toDate();

    const listings = await database.listing.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: prismaSelectListings,
      take: 50,
      where: {
        expiresAt: {
          gt: now,
        },
        OR: [{ availableTo: null }, { availableTo: { gt: now } }],
        status: E_ListingStatusServer.ACTIVE,
      },
    });

    const result = {
      listings,
    };

    await client.set(key, serializeBigInt(result), {
      ex: cacheTimeServer.listing,
    });

    return await responseOnSuccess({
      cacheResponse: {
        maxAge: cacheTimeServer.listing,
      },
      data: { ...result },
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
    return redirectOnError;
  }
};

export const getListingCity = async ({
  listingCity,
  listingCityDistrict,
  request,
}: {
  listingCity: null | T_CityName | undefined;
  listingCityDistrict: null | T_CityDistrictName | undefined;
  request: Request;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  if (!listingCity) {
    throwNotFound();
  }

  const resultZod = await zodValidator.listingCity.safeParseAsync(listingCity);
  if (resultZod.error) {
    throwNotFound();
  }

  try {
    const key = `city:${listingCity}${listingCityDistrict ? `-${listingCityDistrict}` : ""}`;
    const cached = (await client.get(key)) as {
      city: T_City;
      district?: T_CityDistrict;
    } | null;

    if (cached?.city) {
      const cityCategoryCounts = await getCityListingCountsByCategory({
        cityId: cached.city.id,
      });

      return await responseOnSuccess({
        cacheResponse: {
          maxAge: cacheTimeServer.city,
        },
        data: { ...cached, cityCategoryCounts },
        extraHeaders: {
          "Cache-Control": "no-store",
          "X-Cache": "HIT",
        },
        request,
        status: 200,
      });
    }

    const foundCity = await database.city.findUnique({
      select: prismaSelectCity,
      where: {
        nameSearch: listingCity?.toLowerCase(),
        ...(listingCityDistrict
          ? {
              districts: {
                some: {
                  nameSearch: {
                    equals: listingCityDistrict,
                  },
                },
              },
            }
          : {}),
      },
    });

    if (!foundCity) {
      throwNotFound();
    }

    let result: {
      city: T_City;
      district?: T_CityDistrict;
    } = {
      city: foundCity,
    };

    if (listingCityDistrict) {
      const foundDistrict = foundCity?.districts?.find(
        item => item.nameSearch === listingCityDistrict,
      );

      if (!foundDistrict) {
        throwNotFound();
      }

      result = {
        city: foundCity,
        district: foundDistrict,
      };
    }

    await client.set(key, serializeBigInt(result), {
      ex: cacheTimeServer.city,
    });

    const cityCategoryCounts = await getCityListingCountsByCategory({
      cityId: foundCity.id,
    });

    return await responseOnSuccess({
      cacheResponse: {
        maxAge: cacheTimeServer.city,
      },
      data: { ...result, cityCategoryCounts },
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
    return redirectOnError;
  }
};

const getAllCitiesCached = async (): Promise<null | T_City[]> => {
  const key = `allCities`;
  const cached = (await client.get(key)) as { cities: T_City[] } | null;
  if (cached?.cities) {
    return cached.cities;
  }

  const foundCities = await database.city.findMany({
    select: prismaSelectCity,
  });

  if (foundCities.length === 0) {
    return null;
  }

  await client.set(key, serializeBigInt({ cities: foundCities }), {
    ex: cacheTimeServer.city,
  });

  return foundCities;
};

export const getListingCities = async ({ request }: { request: Request }) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const [cities, cityCounts] = await Promise.all([
      getAllCitiesCached(),
      getActiveCityTotals(),
    ]);
    if (!cities) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      cacheResponse: {
        maxAge: cacheTimeServer.city,
      },
      data: { cities, cityCounts },
      extraHeaders: {
        "Cache-Control": "no-store",
      },
      request,
      status: 200,
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error(error);
    return redirectOnError;
  }
};

export const getListingCitiesForCategory = async ({
  category,
  request,
}: {
  category: T_ListingCategoryServer;
  request: Request;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const [allCities, counts] = await Promise.all([
      getAllCitiesCached(),
      getCategoryCityCounts({ category }),
    ]);

    if (!allCities) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      cacheResponse: {
        maxAge: cacheTimeServer.listing,
      },
      data: {
        categoryCityCounts: counts,
        cities: allCities,
      },
      extraHeaders: {
        "Cache-Control": "no-store",
      },
      request,
      status: 200,
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error(error);
    return redirectOnError;
  }
};

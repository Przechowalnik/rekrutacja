import { Params } from "react-router";

import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { T_City } from "~/models/city";
import {
  allLocationRadius,
  E_ListingCategory,
  E_ListingType,
  getCategoryFromSlug,
  isInListingPlotTypes,
  isInListingPlotTypesRent,
  isInListingPlotTypesSale,
  T_ListingAccess,
  T_ListingCondition,
  T_ListingContainerType,
  T_ListingContractType,
  T_ListingParkingType,
  T_ListingPlotType,
  T_ListingType,
  T_ListingUnitType,
  T_LocationRadius,
} from "~/models/enums";
import { isNumber, isTodayOrFuture } from "~/utilities/functions";

import type {
  T_SearchListingLive,
  T_SearchListingProperties,
} from "./SearchListingsContext";

export const makeDefaultSearchListings = (): T_SearchListingProperties => ({
  calendar: {
    availableFrom: null,
    longTerm: false,
    rentalDays: null,
    shortTerm: false,
  },
  categoryAndFilters: {
    category: null,
    condition: null,
    containerTypes: [],
    parkingTypes: [],
    plotTypes: [],
    unitTypes: [],
  },
  extraFilters: { access: null, contractType: null, type: null },
  location: { city: null, district: null, radius: null },
});

export const generateNewSearchListingToSave = ({
  searchListing,
}: {
  searchListing: T_SearchListingProperties;
}) => {
  return searchListing.location?.city
    ? {
        [formNames.listingCity]: searchListing.location.city,
        ...(searchListing.categoryAndFilters?.category
          ? {
              [formNames.listingCategory]:
                searchListing.categoryAndFilters.category,
            }
          : {}),
        ...(searchListing.location.district
          ? {
              [formNames.listingDistrict]: searchListing.location.district,
            }
          : {}),
        ...(searchListing.location.radius
          ? {
              [formNames.locationRadius]: searchListing.location.radius,
            }
          : {}),
        ...(searchListing.categoryAndFilters.category ===
          E_ListingCategory.PARKING &&
        searchListing.categoryAndFilters.parkingTypes.length > 0
          ? {
              [formNames.listingParkingTypes]:
                searchListing.categoryAndFilters.parkingTypes,
            }
          : {}),
        ...(searchListing.categoryAndFilters.category ===
          E_ListingCategory.CONTAINER &&
        searchListing.categoryAndFilters.containerTypes.length > 0
          ? {
              [formNames.listingContainerTypes]:
                searchListing.categoryAndFilters.containerTypes,
            }
          : {}),
        ...(searchListing.categoryAndFilters.category ===
          E_ListingCategory.UNIT &&
        searchListing.categoryAndFilters.unitTypes.length > 0
          ? {
              [formNames.listingUnitTypes]:
                searchListing.categoryAndFilters.unitTypes,
            }
          : {}),
        ...(searchListing.categoryAndFilters.category ===
          E_ListingCategory.PLOT &&
        searchListing.categoryAndFilters.plotTypes.length > 0
          ? {
              [formNames.listingPlotTypes]:
                searchListing.categoryAndFilters.plotTypes,
            }
          : {}),
        ...(searchListing.categoryAndFilters.category &&
        searchListing.categoryAndFilters.condition
          ? {
              [formNames.listingCondition]:
                searchListing.categoryAndFilters.condition,
            }
          : {}),
        ...(searchListing.calendar.shortTerm &&
        searchListing.calendar.rentalDays &&
        searchListing.extraFilters.type === E_ListingType.RENT &&
        isNumber(searchListing.calendar.rentalDays)
          ? {
              [formNames.listingRentalDays]: searchListing.calendar.rentalDays,
            }
          : {}),
        ...(searchListing.calendar.shortTerm &&
        searchListing.extraFilters.type === E_ListingType.RENT
          ? {
              [formNames.checkboxListingShortTerm]:
                searchListing.calendar.shortTerm,
            }
          : {}),
        ...(searchListing.calendar.longTerm &&
        searchListing.extraFilters.type === E_ListingType.RENT
          ? {
              [formNames.checkboxListingLongTerm]:
                searchListing.calendar.longTerm,
            }
          : {}),
        ...(searchListing.calendar.availableFrom
          ? {
              [formNames.listingAvailableFrom]:
                searchListing.calendar.availableFrom,
            }
          : {}),
        ...(searchListing.extraFilters.access
          ? {
              [formNames.listingAccess]: searchListing.extraFilters.access,
            }
          : {}),
        ...(searchListing.extraFilters.contractType
          ? {
              [formNames.listingContractType]:
                searchListing.extraFilters.contractType,
            }
          : {}),
        ...(searchListing.extraFilters.type
          ? {
              [formNames.listingType]: searchListing.extraFilters.type,
            }
          : {}),
      }
    : null;
};

type T_GenerateSearchListingsResult =
  | {
      newSearchListing: T_SearchListingProperties | undefined;
      newSearchListingLive?: T_SearchListingLive;
    }
  | undefined;

export const generateSearchListings = ({
  newCity,
  parameters,
  searchParameters,
}: {
  newCity: null | T_City;
  parameters: Readonly<Params<string>>;
  searchParameters: URLSearchParams;
}): T_GenerateSearchListingsResult => {
  const errorMessageValidatorCity = checkFormValidator({
    formName: formNames.listingCity,
    value: newCity?.nameSearch ?? null,
  });

  let newSearchListingLive: T_SearchListingLive | undefined;

  const searchListingsCategoryFromUrl = parameters?.listingCategory
    ? getCategoryFromSlug(parameters.listingCategory)
    : null;

  const searchListingsDistrictFromUrl = parameters?.listingCityDistrict ?? null;

  const searchListingsPlotTypesFromUrl = (searchParameters.getAll(
    formNames.listingPlotTypes,
  ) ?? null) as null | string[];

  const searchListingsParkingTypesFromUrl = (searchParameters.getAll(
    formNames.listingParkingTypes,
  ) ?? null) as null | string[];

  const searchListingsContainerTypesFromUrl = (searchParameters.getAll(
    formNames.listingContainerTypes,
  ) ?? null) as null | string[];

  const searchListingsConditionFromUrl = (searchParameters.get(
    formNames.listingCondition,
  ) ?? null) as null | T_ListingCondition;

  const searchListingsUnitTypesFromUrl = (searchParameters.getAll(
    formNames.listingUnitTypes,
  ) ?? null) as null | string[];

  const locationRadiusToValidInSearch = searchParameters.get(
    formNames.locationRadius,
  );

  const searchRadiusFromUrl = (
    locationRadiusToValidInSearch && isNumber(locationRadiusToValidInSearch)
      ? Number(locationRadiusToValidInSearch)
      : null
  ) as null | T_LocationRadius;

  const searchListingsType = (searchParameters.get(formNames.listingType) ??
    null) as null | T_ListingType;

  const searchListingsContractType = (searchParameters.get(
    formNames.listingContractType,
  ) ?? null) as null | T_ListingContractType;

  const searchListingsAccess = (searchParameters.get(formNames.listingAccess) ??
    null) as null | T_ListingAccess;

  const searchListingsAvailableFromUrl =
    searchParameters.get(formNames.listingAvailableFrom) ?? null;

  const searchListingsRentalDaysFromUrl =
    searchParameters.get(formNames.listingRentalDays) ?? null;

  const searchListingsShortTermFromUrl =
    searchParameters.get(formNames.listingShortTerm) ?? null;

  const searchListingsLongTermFromUrl =
    searchParameters.get(formNames.listingLongTerm) ?? null;

  const validSearchListingParkingTypesFromQuery =
    searchListingsParkingTypesFromUrl ?? null;

  const searchListingParkingTypesFromQuery: T_ListingParkingType[] =
    Array.isArray(validSearchListingParkingTypesFromQuery)
      ? (validSearchListingParkingTypesFromQuery as T_ListingParkingType[])
      : [];

  const validSearchListingContainerTypesFromQuery =
    searchListingsContainerTypesFromUrl ?? null;

  const searchListingContainerTypesFromQuery: T_ListingContainerType[] =
    Array.isArray(validSearchListingContainerTypesFromQuery)
      ? (validSearchListingContainerTypesFromQuery as T_ListingContainerType[])
      : [];

  const validSearchListingPlotTypesFromQuery =
    searchListingsPlotTypesFromUrl ?? null;

  const searchListingPlotTypesFromQuery: T_ListingPlotType[] = Array.isArray(
    validSearchListingPlotTypesFromQuery,
  )
    ? (validSearchListingPlotTypesFromQuery as T_ListingPlotType[])
    : [];

  const validSearchListingUnitTypesFromQuery =
    searchListingsUnitTypesFromUrl ?? null;

  const searchListingUnitTypesFromQuery: T_ListingUnitType[] = Array.isArray(
    validSearchListingUnitTypesFromQuery,
  )
    ? (validSearchListingUnitTypesFromQuery as T_ListingUnitType[])
    : [];

  const errorMessageValidatorCategory = checkFormValidator({
    formName: formNames.listingCategory,
    value: searchListingsCategoryFromUrl,
  });

  const errorMessageValidatorDistrict = checkFormValidator({
    formName: formNames.listingDistrict,
    value: searchListingsDistrictFromUrl,
  });

  const isValidDistrictInCity = Boolean(
    searchListingsDistrictFromUrl &&
    !errorMessageValidatorDistrict &&
    !errorMessageValidatorCity,
  );

  const errorMessageValidatorRadius = checkFormValidator({
    formName: formNames.locationRadius,
    value: searchRadiusFromUrl,
  });

  const isValidRadius =
    searchRadiusFromUrl &&
    !errorMessageValidatorRadius &&
    !errorMessageValidatorCity &&
    errorMessageValidatorDistrict
      ? allLocationRadius.includes(searchRadiusFromUrl)
      : false;

  const errorMessageValidatorParkingTypes = checkFormValidator({
    formName: formNames.listingParkingTypes,
    value: searchListingParkingTypesFromQuery,
  });

  const errorMessageValidatorContainerTypes = checkFormValidator({
    formName: formNames.listingContainerTypes,
    value: searchListingContainerTypesFromQuery,
  });

  const errorMessageValidatorPlotTypes = checkFormValidator({
    formName: formNames.listingPlotTypes,
    value: searchListingPlotTypesFromQuery,
  });

  let isCorrectValuesPlotTypes = false;
  if (!errorMessageValidatorPlotTypes) {
    if (!searchListingsType) {
      isCorrectValuesPlotTypes = searchListingPlotTypesFromQuery.every(item =>
        isInListingPlotTypes(item),
      );
    } else if (searchListingsType === E_ListingType.RENT) {
      isCorrectValuesPlotTypes = searchListingPlotTypesFromQuery.every(item =>
        isInListingPlotTypesRent(item),
      );
    } else {
      isCorrectValuesPlotTypes = searchListingPlotTypesFromQuery.every(item =>
        isInListingPlotTypesSale(item),
      );
    }
  }

  const errorMessageValidatorCondition = checkFormValidator({
    formName: formNames.listingCondition,
    value: searchListingsConditionFromUrl,
  });

  const errorMessageValidatorUnitTypes = checkFormValidator({
    formName: formNames.listingUnitTypes,
    value: searchListingUnitTypesFromQuery,
  });

  const errorMessageValidatorAvailableFrom = checkFormValidator({
    formName: formNames.listingAvailableFrom,
    value: searchListingsAvailableFromUrl,
  });

  const errorMessageValidatorRentalDays = checkFormValidator({
    formName: formNames.listingRentalDays,
    optional: true,
    value: isNumber(searchListingsRentalDaysFromUrl)
      ? Number(searchListingsRentalDaysFromUrl)
      : null,
  });

  const errorMessageValidatorShortTerm = checkFormValidator({
    formName: formNames.checkboxListingShortTerm,
    optional: true,
    value: searchListingsShortTermFromUrl
      ? searchListingsShortTermFromUrl === "true"
      : null,
  });

  const errorMessageValidatorLongTerm = checkFormValidator({
    formName: formNames.checkboxListingLongTerm,
    optional: true,
    value: searchListingsLongTermFromUrl
      ? searchListingsLongTermFromUrl === "true"
      : null,
  });

  const errorMessageValidatorType = checkFormValidator({
    formName: formNames.listingType,
    value: searchListingsType,
  });

  const errorMessageValidatorContractType = checkFormValidator({
    formName: formNames.listingContractType,
    value: searchListingsContractType,
  });

  const errorMessageValidatorAccess = checkFormValidator({
    formName: formNames.listingAccess,
    value: searchListingsAccess,
  });

  let dataToUpdatesSearchListing: T_SearchListingProperties =
    makeDefaultSearchListings();

  if (
    (!errorMessageValidatorAvailableFrom && searchListingsAvailableFromUrl) ||
    (!errorMessageValidatorRentalDays &&
      searchListingsType === E_ListingType.RENT &&
      searchListingsRentalDaysFromUrl) ||
    (!errorMessageValidatorShortTerm && searchListingsShortTermFromUrl) ||
    (!errorMessageValidatorLongTerm && searchListingsLongTermFromUrl)
  ) {
    const isCorrectDate =
      !errorMessageValidatorAvailableFrom && searchListingsAvailableFromUrl
        ? isTodayOrFuture({
            isoDate: searchListingsAvailableFromUrl,
          })
        : false;

    dataToUpdatesSearchListing = {
      ...dataToUpdatesSearchListing,
      calendar: {
        availableFrom: isCorrectDate
          ? (searchListingsAvailableFromUrl ?? null)
          : null,
        longTerm:
          !errorMessageValidatorLongTerm &&
          searchListingsLongTermFromUrl &&
          searchListingsType === E_ListingType.RENT
            ? searchListingsLongTermFromUrl === "true"
            : false,
        rentalDays:
          !errorMessageValidatorShortTerm &&
          searchListingsShortTermFromUrl &&
          !errorMessageValidatorRentalDays &&
          searchListingsType === E_ListingType.RENT &&
          searchListingsRentalDaysFromUrl
            ? Number(searchListingsRentalDaysFromUrl)
            : null,
        shortTerm:
          !errorMessageValidatorShortTerm &&
          searchListingsShortTermFromUrl &&
          searchListingsType === E_ListingType.RENT
            ? searchListingsShortTermFromUrl === "true"
            : false,
      },
    };
  }

  let condition: null | T_ListingCondition = null;
  let parkingTypes: T_ListingParkingType[] = [];
  let plotTypes: T_ListingPlotType[] = [];
  let unitTypes: T_ListingUnitType[] = [];
  let containerTypes: T_ListingContainerType[] = [];

  if (
    !errorMessageValidatorCategory &&
    !errorMessageValidatorCondition &&
    searchListingsCategoryFromUrl
  ) {
    condition = searchListingsConditionFromUrl;
  }

  if (
    !errorMessageValidatorCategory &&
    !errorMessageValidatorContainerTypes &&
    searchListingsCategoryFromUrl === E_ListingCategory.CONTAINER &&
    searchListingContainerTypesFromQuery.length > 0
  ) {
    containerTypes = searchListingContainerTypesFromQuery;
  }

  if (
    !errorMessageValidatorCategory &&
    !errorMessageValidatorParkingTypes &&
    searchListingsCategoryFromUrl === E_ListingCategory.PARKING &&
    searchListingParkingTypesFromQuery.length > 0
  ) {
    parkingTypes = searchListingParkingTypesFromQuery;
  }

  if (
    !errorMessageValidatorCategory &&
    !errorMessageValidatorPlotTypes &&
    isCorrectValuesPlotTypes &&
    searchListingsCategoryFromUrl === E_ListingCategory.PLOT &&
    searchListingPlotTypesFromQuery.length > 0
  ) {
    plotTypes = searchListingPlotTypesFromQuery;
  }

  if (
    !errorMessageValidatorCategory &&
    !errorMessageValidatorUnitTypes &&
    searchListingsCategoryFromUrl === E_ListingCategory.UNIT &&
    searchListingUnitTypesFromQuery.length > 0
  ) {
    unitTypes = searchListingUnitTypesFromQuery;
  }

  dataToUpdatesSearchListing = {
    ...dataToUpdatesSearchListing,
    categoryAndFilters: {
      category: errorMessageValidatorCategory
        ? null
        : searchListingsCategoryFromUrl,
      condition,
      containerTypes,
      parkingTypes,
      plotTypes,
      unitTypes,
    },
    location: {
      city: newCity?.nameSearch ?? null,
      district:
        isValidDistrictInCity && !isValidRadius
          ? (searchListingsDistrictFromUrl ?? null)
          : null,
      radius:
        isValidRadius && !isValidDistrictInCity
          ? (searchRadiusFromUrl ?? null)
          : null,
    },
  };

  if (
    !errorMessageValidatorType ||
    !errorMessageValidatorContractType ||
    !errorMessageValidatorAccess
  ) {
    dataToUpdatesSearchListing = {
      ...dataToUpdatesSearchListing,
      extraFilters: {
        access: errorMessageValidatorAccess ? null : searchListingsAccess,
        contractType: errorMessageValidatorContractType
          ? null
          : searchListingsContractType,
        type: errorMessageValidatorType ? null : searchListingsType,
      },
    };
  }

  const newSearchListing: T_SearchListingProperties =
    dataToUpdatesSearchListing;

  if (!errorMessageValidatorCity && newCity?.nameSearch) {
    newSearchListingLive = {
      [formNames.listingCity]: newCity?.nameSearch,
      ...(!errorMessageValidatorCategory && searchListingsCategoryFromUrl
        ? {
            [formNames.listingCategory]: searchListingsCategoryFromUrl,
          }
        : {}),
      ...(isValidDistrictInCity && searchListingsDistrictFromUrl
        ? {
            [formNames.listingDistrict]: searchListingsDistrictFromUrl,
          }
        : {
            ...(searchRadiusFromUrl && !isValidDistrictInCity
              ? {
                  [formNames.locationRadius]: searchRadiusFromUrl,
                }
              : {}),
          }),
      ...(!errorMessageValidatorCategory &&
      !errorMessageValidatorParkingTypes &&
      searchListingsCategoryFromUrl === E_ListingCategory.PARKING &&
      searchListingParkingTypesFromQuery.length > 0
        ? {
            [formNames.listingParkingTypes]: searchListingParkingTypesFromQuery,
          }
        : {}),
      ...(!errorMessageValidatorCategory &&
      !errorMessageValidatorContainerTypes &&
      searchListingsCategoryFromUrl === E_ListingCategory.CONTAINER &&
      searchListingContainerTypesFromQuery.length > 0
        ? {
            [formNames.listingContainerTypes]:
              searchListingContainerTypesFromQuery,
          }
        : {}),
      ...(!errorMessageValidatorCategory &&
      !errorMessageValidatorPlotTypes &&
      isCorrectValuesPlotTypes &&
      searchListingsCategoryFromUrl === E_ListingCategory.PLOT &&
      searchListingPlotTypesFromQuery.length > 0
        ? {
            [formNames.listingPlotTypes]: searchListingPlotTypesFromQuery,
          }
        : {}),
      ...(!errorMessageValidatorCategory &&
      !errorMessageValidatorCondition &&
      searchListingsConditionFromUrl
        ? {
            [formNames.listingCondition]: searchListingsConditionFromUrl,
          }
        : {}),
      ...(!errorMessageValidatorCategory &&
      !errorMessageValidatorUnitTypes &&
      searchListingsCategoryFromUrl === E_ListingCategory.UNIT &&
      searchListingUnitTypesFromQuery.length > 0
        ? {
            [formNames.listingUnitTypes]: searchListingUnitTypesFromQuery,
          }
        : {}),
      ...(!errorMessageValidatorShortTerm &&
      searchListingsShortTermFromUrl &&
      searchListingsType === E_ListingType.RENT
        ? {
            [formNames.checkboxListingShortTerm]:
              searchListingsShortTermFromUrl === "true",
          }
        : {}),
      ...(!errorMessageValidatorLongTerm &&
      searchListingsLongTermFromUrl &&
      searchListingsType === E_ListingType.RENT
        ? {
            [formNames.checkboxListingLongTerm]:
              searchListingsLongTermFromUrl === "true",
          }
        : {}),
      ...(!errorMessageValidatorShortTerm &&
      searchListingsShortTermFromUrl &&
      !errorMessageValidatorRentalDays &&
      searchListingsRentalDaysFromUrl &&
      searchListingsType === E_ListingType.RENT &&
      isNumber(searchListingsRentalDaysFromUrl)
        ? {
            [formNames.listingRentalDays]: Number(
              searchListingsRentalDaysFromUrl,
            ),
          }
        : {}),
      ...(!errorMessageValidatorAvailableFrom && searchListingsAvailableFromUrl
        ? {
            [formNames.listingAvailableFrom]: searchListingsAvailableFromUrl,
          }
        : {}),
      ...(!errorMessageValidatorType && searchListingsType
        ? {
            [formNames.listingType]: searchListingsType,
          }
        : {}),
      ...(!errorMessageValidatorContractType && searchListingsContractType
        ? {
            [formNames.listingContractType]: searchListingsContractType,
          }
        : {}),
      ...(!errorMessageValidatorAccess && searchListingsAccess
        ? {
            [formNames.listingAccess]: searchListingsAccess,
          }
        : {}),
    };

    return {
      newSearchListing,
      newSearchListingLive,
    };
  } else {
    return { newSearchListing, newSearchListingLive };
  }
};

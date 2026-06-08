import { Params } from "react-router";

import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { T_City } from "~/models/city";
import {
  allLocationRadius,
  getCategoryFromSlug,
  isInWorkMode,
  T_LocationRadius,
  T_WorkMode,
} from "~/models/enums";
import { isNumber } from "~/utilities/functions";

import type {
  T_SearchListingLive,
  T_SearchListingProperties,
} from "./SearchListingsContext";

export const makeDefaultSearchListings = (): T_SearchListingProperties => ({
  categoryAndFilters: {
    category: null,
  },
  extraFilters: { workModes: [] },
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
        ...(searchListing.extraFilters.workModes.length > 0
          ? {
              [formNames.listingWorkModes]:
                searchListing.extraFilters.workModes,
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

  const searchListingsWorkModesFromUrl = searchParameters.getAll(
    formNames.listingWorkModes,
  );

  const workModes: T_WorkMode[] = searchListingsWorkModesFromUrl.filter(item =>
    isInWorkMode(item),
  ) as T_WorkMode[];

  const locationRadiusToValidInSearch = searchParameters.get(
    formNames.locationRadius,
  );

  const searchRadiusFromUrl = (
    locationRadiusToValidInSearch && isNumber(locationRadiusToValidInSearch)
      ? Number(locationRadiusToValidInSearch)
      : null
  ) as null | T_LocationRadius;

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

  const newSearchListing: T_SearchListingProperties = {
    categoryAndFilters: {
      category: errorMessageValidatorCategory
        ? null
        : searchListingsCategoryFromUrl,
    },
    extraFilters: {
      workModes,
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
      ...(workModes.length > 0
        ? {
            [formNames.listingWorkModes]: workModes,
          }
        : {}),
    };
  }

  return { newSearchListing, newSearchListingLive };
};

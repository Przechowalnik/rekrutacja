import type { i18n } from "i18next";

import { E_Routes, getRoute } from "~/constants/routes";
import { T_AutocompletePlace } from "~/models/autocompletePlace";
import { T_AutocompletePlaceSuggestions } from "~/models/autocompletePlaceSuggestions";
import { getLocalizedValue } from "~/utilities/locales";

import { axiosClient } from "./axiosClient";

export async function getPlaceSuggestions(
  input: string,
  options: { sessionToken: string; signal?: AbortSignal },
) {
  if (!input.trim()) {
    return [];
  }

  const response = await axiosClient.post<{
    autocompletePlaceSuggestions: T_AutocompletePlaceSuggestions;
  }>(
    getRoute({ route: E_Routes.apiAutocompleteAddress }),
    {
      autocompleteAddress: input,
      autocompleteSessionToken: options?.sessionToken,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      signal: options?.signal,
    },
  );

  if (!response?.data?.autocompletePlaceSuggestions) {
    return [];
  }

  const suggestions = response?.data?.autocompletePlaceSuggestions || [];

  return suggestions;
}

export async function getPlaceDetails({
  i18n,
  placeId,
}: {
  i18n: i18n;
  placeId: string;
}): Promise<null | T_AutocompletePlace> {
  if (!placeId) {
    return null;
  }

  const response = await axiosClient.put<{
    autocompletePlace: T_AutocompletePlace;
  }>(
    getRoute({ route: E_Routes.apiAutocompleteAddress }),
    {
      autocompletePlaceId: placeId,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  if (!response?.data?.autocompletePlace) {
    return null;
  }

  const addressPlaceDetails: T_AutocompletePlace = {
    ...response?.data?.autocompletePlace,
    country:
      getLocalizedValue({
        dictionaryKey: "countriesCode",
        i18n,
        translateToLang: "en",
        value: response.data.autocompletePlace.country,
      })?.toUpperCase() ?? response.data.autocompletePlace.country,
  };

  return addressPlaceDetails;
}

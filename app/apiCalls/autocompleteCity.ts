import { E_Routes, getRoute } from "~/constants/routes";
import { T_Cities } from "~/models/cities";

import { axiosClient } from "./axiosClient";

export async function getCitySuggestions(
  input: string,
  options: { signal?: AbortSignal },
) {
  if (!input.trim()) {
    return [];
  }

  const response = await axiosClient.post<{
    cities: T_Cities;
  }>(
    getRoute({ route: E_Routes.apiAutocompleteCity }),
    {
      listingCity: input,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      signal: options?.signal,
    },
  );

  if (!response?.data?.cities) {
    return [];
  }

  const suggestions = response?.data?.cities || [];

  return suggestions;
}

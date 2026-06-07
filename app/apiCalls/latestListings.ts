import { E_Routes, getRoute } from "~/constants/routes";
import { T_Listings, Z_Listings } from "~/models/listings";

import { axiosClient } from "./axiosClient";

export const fetchLatestListings = async (): Promise<null | T_Listings> => {
  try {
    const response = await axiosClient.get(
      getRoute({ route: E_Routes.apiLatestListings }),
      { withCredentials: true },
    );

    const result = Z_Listings.safeParse(response?.data?.listings);

    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

import { notifications } from "@mantine/notifications";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Params, useNavigate } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { T_City } from "~/models/city";
import { T_CityDistrictName, T_CityName } from "~/models/cityNested";
import {
  getCategorySlug,
  T_ListingCategory,
  T_LocationRadius,
  T_WorkMode,
} from "~/models/enums";
import { compareObjects } from "~/utilities/functions";
import { generateExtraQueryToSearch } from "~/utilities/listing";

import {
  generateNewSearchListingToSave,
  generateSearchListings,
  makeDefaultSearchListings,
} from "./utilities";

export type T_SearchListingsExtraFilters = {
  workModes: T_WorkMode[];
};

export type T_SearchListingsLocation = {
  city: null | T_CityName;
  district: null | T_CityDistrictName;
  radius: null | T_LocationRadius;
};

export type T_SearchListingsCategoryAndFilters = {
  category: null | T_ListingCategory;
};

export type T_SearchListingLive = {
  listingCategory?: T_ListingCategory;
  listingCity?: T_CityName;
  listingDistrict?: T_CityDistrictName;
  listingWorkModes?: T_WorkMode[];
};

export type T_SearchListingProperties = {
  categoryAndFilters: T_SearchListingsCategoryAndFilters;
  extraFilters: T_SearchListingsExtraFilters;
  location: T_SearchListingsLocation;
};

export type T_OnChangeSearchListing = Partial<T_SearchListingProperties>;

export type T_SearchListings = {
  haveChangesInSearchToSave: boolean;
  initialUpdate: (properties: {
    newCity: null | T_City;
    parameters: Readonly<Params<string>>;
    searchParameters: URLSearchParams;
  }) => void;
  onChangeSearchListing: (newData: T_OnChangeSearchListing) => void;
  onClickSearchListings: () => void;
  searchListing: T_SearchListingProperties;
  searchListingLive: T_SearchListingLive | undefined;
};

export const SearchListingsContext = createContext<T_SearchListings>({
  haveChangesInSearchToSave: false,
  initialUpdate: () => {},
  onChangeSearchListing: () => {},
  onClickSearchListings: () => {},
  searchListing: makeDefaultSearchListings(),
  searchListingLive: undefined,
});

export const SearchListingsContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [haveChangesInSearchToSave, setHaveChangesInSearchToSave] =
    useState(false);
  const [searchListingLive, setSearchListingLive] =
    useState<T_SearchListingLive>();
  const [searchListing, setSearchListing] = useState<T_SearchListingProperties>(
    makeDefaultSearchListings(),
  );
  const { getLocalizedRoute } = useLocalizedRoute();

  const searchListingToSave = useRef<T_SearchListingLive>(null);

  const navigate = useNavigate();

  const { t: tNotifications } = useTranslation(namespaces.notifications);

  useEffect(() => {
    if (
      !searchListing?.location?.city ||
      !searchListing?.categoryAndFilters?.category
    ) {
      return;
    }

    const newSearchListingToSave = generateNewSearchListingToSave({
      searchListing,
    });
    searchListingToSave.current = newSearchListingToSave;

    let haveChanges = false;

    if (newSearchListingToSave) {
      haveChanges = searchListingLive
        ? !compareObjects({
            object1: searchListingLive,
            object2: newSearchListingToSave,
          })
        : true;
    }

    setHaveChangesInSearchToSave(haveChanges);
  }, [searchListing]);

  const onChangeSearchListing = useCallback(
    ({
      categoryAndFilters,
      extraFilters,
      location,
    }: T_OnChangeSearchListing) => {
      if (categoryAndFilters || extraFilters || location) {
        setSearchListing(previousState => {
          return {
            ...previousState,
            ...(categoryAndFilters
              ? {
                  categoryAndFilters,
                }
              : {}),
            ...(extraFilters
              ? {
                  extraFilters,
                }
              : {}),
            ...(location
              ? {
                  location: {
                    city: location.city,
                    district:
                      !location.radius && location.district && location.city
                        ? location.district
                        : null,
                    radius:
                      location.city && !(location.district && location.city)
                        ? location.radius
                        : null,
                  },
                }
              : {}),
          };
        });
      } else {
        setSearchListing(makeDefaultSearchListings());
        setSearchListingLive(undefined);
      }
    },
    [],
  );

  const initialUpdate = useCallback(
    ({
      newCity,
      parameters,
      searchParameters,
    }: {
      newCity: null | T_City;
      parameters: Readonly<Params<string>>;
      searchParameters: URLSearchParams;
    }) => {
      const result = generateSearchListings({
        newCity,
        parameters,
        searchParameters,
      });

      if (!result) {
        notifications.show({
          color: "red",
          message: tNotifications(`searchListingsError.message`),
          title: tNotifications(`searchListingsError.title`),
        });
        return;
      }

      if (result?.newSearchListing) {
        setSearchListing(result.newSearchListing);
      }

      if (result?.newSearchListingLive) {
        setSearchListingLive(result.newSearchListingLive);
      }
    },
    [tNotifications],
  );

  const onClickSearchListings = useCallback(() => {
    if (!searchListingToSave.current) {
      return;
    }

    setSearchListingLive(searchListingToSave.current);
    setHaveChangesInSearchToSave(false);

    if (
      searchListing.location.city &&
      searchListing.categoryAndFilters.category
    ) {
      const isValidDistrictInCity = Boolean(
        searchListing.location.district &&
        searchListing.location.city &&
        !searchListing?.location?.radius,
      );

      navigate(
        getLocalizedRoute({
          extraPath: `/${getCategorySlug(searchListing.categoryAndFilters.category)}/${searchListing.location.city.toLowerCase()}${isValidDistrictInCity ? `/${searchListing.location.district}` : ""}`,
          extraQuery: generateExtraQueryToSearch({
            searchListing,
          }),
          route: E_Routes.search,
        }),
      );
    }
  }, [searchListing]);

  const contextValues = useMemo(
    () => ({
      haveChangesInSearchToSave,
      initialUpdate,
      onChangeSearchListing,
      onClickSearchListings,
      searchListing,
      searchListingLive,
    }),
    [
      haveChangesInSearchToSave,
      initialUpdate,
      onChangeSearchListing,
      onClickSearchListings,
      searchListing,
      searchListingLive,
    ],
  );

  return (
    <SearchListingsContext.Provider value={contextValues}>
      {children}
    </SearchListingsContext.Provider>
  );
};

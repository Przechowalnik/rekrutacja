import { memo, useCallback } from "react";
import { useNavigate } from "react-router";

import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSearchListings } from "~/hooks/useSearchListings";
import { T_City } from "~/models/city";
import { getCategorySlug, T_ListingCategory } from "~/models/enums";
import { generateExtraQueryToSearch } from "~/utilities/listing";

import { Button } from "../Button";

type T_CardListingCity = {
  category?: null | T_ListingCategory;
  city: T_City;
  count?: number;
};

const CardListingCityToMemoize = ({
  category,
  city,
  count,
}: T_CardListingCity) => {
  const navigate = useNavigate();
  const { getLocalizedRoute } = useLocalizedRoute();
  const { searchListing } = useSearchListings();

  const handleClick = useCallback(() => {
    if (!city) {
      return;
    }

    if (category) {
      navigate(
        getLocalizedRoute({
          extraPath: `/${getCategorySlug(category)}/${city.nameSearch.toLowerCase()}`,
          extraQuery: generateExtraQueryToSearch({
            searchListing,
          }),
          route: E_Routes.search,
        }),
      );
      return;
    }

    navigate(
      getLocalizedRoute({
        extraPath: `/${city.nameSearch.toLowerCase()}`,
        extraQuery: generateExtraQueryToSearch({
          searchListing,
        }),
        route: E_Routes.cities,
      }),
    );
  }, [city, searchListing]);

  const labelText = `${city.name}${
    typeof count === "number" && count > 0 ? ` (${count})` : ""
  }`;

  return (
    <Button
      ariaLabel={labelText}
      h={150}
      onClick={handleClick}
      size="xl"
      variant="light"
      w={{
        base: "100%",
        sm: "calc(33% - 4px)",
      }}
    >
      {labelText}
    </Button>
  );
};

export const CardListingCity = memo(CardListingCityToMemoize);

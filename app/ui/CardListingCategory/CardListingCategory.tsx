import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSearchListings } from "~/hooks/useSearchListings";
import { T_City } from "~/models/city";
import { T_CityDistrict } from "~/models/cityNested";
import { getCategorySlug, T_ListingCategory } from "~/models/enums";
import { generateExtraQueryToSearch } from "~/utilities/listing";

import { Button } from "../Button";

type T_CardListingCategory = {
  category: T_ListingCategory;
  city: null | T_City;
  count?: number;
  district?: null | T_CityDistrict;
};

const CardListingCategoryToMemoize = ({
  category,
  city,
  count,
  district,
}: T_CardListingCategory) => {
  const { t } = useTranslation(namespaces.common);
  const navigate = useNavigate();
  const { getLocalizedRoute } = useLocalizedRoute();
  const { searchListing } = useSearchListings();

  const handleClick = useCallback(() => {
    if (!city) {
      navigate(
        getLocalizedRoute({
          extraPath: `/${getCategorySlug(category)}`,
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
        extraPath: district
          ? `/${getCategorySlug(category)}/${city.nameSearch}/${district.nameSearch}`
          : `/${getCategorySlug(category)}/${city.nameSearch}`,
        extraQuery: generateExtraQueryToSearch({
          searchListing,
        }),
        route: E_Routes.search,
      }),
    );
  }, [category, city, searchListing, district]);

  const labelText = `${t(`listingCategoryPlural.${category}`)}${
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

export const CardListingCategory = memo(CardListingCategoryToMemoize);

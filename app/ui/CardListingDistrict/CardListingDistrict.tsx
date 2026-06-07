import { memo, useCallback } from "react";
import { useNavigate } from "react-router";

import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSearchListings } from "~/hooks/useSearchListings";
import { T_City } from "~/models/city";
import { T_CityDistrict } from "~/models/cityNested";
import { generateExtraQueryToSearch } from "~/utilities/listing";

import { Button } from "../Button";

type T_CardListingDistrict = {
  city: T_City;
  district: T_CityDistrict;
};

const CardListingDistrictToMemoize = ({
  city,
  district,
}: T_CardListingDistrict) => {
  const navigate = useNavigate();
  const { getLocalizedRoute } = useLocalizedRoute();
  const { searchListing } = useSearchListings();

  const handleClick = useCallback(() => {
    if (!district) {
      return;
    }

    navigate(
      getLocalizedRoute({
        extraPath: `/${city.nameSearch}/${district.nameSearch.toLowerCase()}`,
        extraQuery: generateExtraQueryToSearch({
          searchListing,
        }),
        route: E_Routes.cities,
      }),
    );
  }, [district, searchListing, city]);

  return (
    <Button
      h={150}
      onClick={handleClick}
      size="xl"
      variant="light"
      w={{
        base: "100%",
        sm: "calc(33% - 4px)",
      }}
    >
      {district.name}
    </Button>
  );
};

export const CardListingDistrict = memo(CardListingDistrictToMemoize);

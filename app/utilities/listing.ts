import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBriefcase,
  faBuilding,
  faChalkboardUser,
  faGears,
  faHeadset,
  faLaptopCode,
  faMoneyBillTrendUp,
  faScaleBalanced,
  faTruck,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";

import { T_SearchListingProperties } from "~/context/SearchListingsContext";
import { formNames } from "~/lib/zodFormValidator";
import { E_ListingCategory, T_ListingCategory } from "~/models/enums";

const categoryIconMap: Partial<Record<T_ListingCategory, IconDefinition>> = {
  [E_ListingCategory.CONSTRUCTION]: faBuilding,
  [E_ListingCategory.CUSTOMER_SERVICE]: faHeadset,
  [E_ListingCategory.EDUCATION]: faChalkboardUser,
  [E_ListingCategory.ENGINEERING]: faGears,
  [E_ListingCategory.FINANCE]: faMoneyBillTrendUp,
  [E_ListingCategory.GASTRONOMY]: faUtensils,
  [E_ListingCategory.IT]: faLaptopCode,
  [E_ListingCategory.LAW]: faScaleBalanced,
  [E_ListingCategory.LOGISTICS]: faTruck,
};

export const generateIconForListingCategory = ({
  listingCategory,
}: {
  listingCategory: null | T_ListingCategory;
}): IconDefinition => {
  return (
    (listingCategory ? categoryIconMap[listingCategory] : undefined) ??
    faBriefcase
  );
};

type T_GenerateExtraQueryToSearch = {
  searchListing: T_SearchListingProperties;
};

export const generateExtraQueryToSearch = ({
  searchListing,
}: T_GenerateExtraQueryToSearch) => {
  const isValidDistrictInCity = Boolean(
    searchListing.location.district && searchListing.location.city,
  );

  return {
    ...(searchListing.location.district && isValidDistrictInCity
      ? {}
      : {
          ...(searchListing.location.radius
            ? {
                [formNames.locationRadius]:
                  searchListing.location.radius.toString(),
              }
            : {}),
        }),
    ...(searchListing.extraFilters.workModes.length > 0
      ? {
          [formNames.listingWorkModes]: searchListing.extraFilters.workModes,
        }
      : {}),
  };
};

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBox,
  faBriefcase,
  faBuildingLock,
  faHotel,
  faHouse,
  faLayerGroup,
  faLocationDot,
  faSquareParking,
  faTableCellsColumnLock,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import { TFunction } from "i18next";

import { T_SearchListingProperties } from "~/context/SearchListingsContext";
import { formNames } from "~/lib/zodFormValidator";
import {
  E_ListingAccess,
  E_ListingCategory,
  E_ListingComfortOption,
  E_ListingCondition,
  E_ListingEntryOption,
  E_ListingParkingType,
  E_ListingSecurityOption,
  E_ListingType,
  E_ListingUsageOptions,
  E_ListingUtilityOption,
  T_ListingAccess,
  T_ListingCategory,
  T_ListingComfortOption,
  T_ListingCondition,
  T_ListingEntryOption,
  T_ListingParkingType,
  T_ListingSecurityOption,
  T_ListingUsageOptions,
  T_ListingUtilityOption,
} from "~/models/enums";
import { T_SelectListingFloorLevels } from "~/ui/SelectListingFloorLevel";

import { isTodayOrFuture } from "./functions";

type T_GenerateOptionsForListingCategory = {
  listingCategory: null | T_ListingCategory;
};

export const generateOptionsForListingCategory = ({
  listingCategory,
}: T_GenerateOptionsForListingCategory) => {
  let securityOptions: T_ListingSecurityOption[] = [];
  let comfortOptions: T_ListingComfortOption[] = [];
  let entryOptions: T_ListingEntryOption[] = [];
  let usageOptions: T_ListingUsageOptions[] = [];
  let utilityOptions: T_ListingUtilityOption[] = [];
  let levels: null | T_SelectListingFloorLevels = null;
  let conditions: T_ListingCondition[] = [];
  let accessOptions: T_ListingAccess[] = [];

  if (!listingCategory) {
    return {
      accessOptions,
      comfortOptions,
      conditions,
      entryOptions,
      securityOptions,
      usageOptions,
      utilityOptions,
    };
  }

  switch (listingCategory) {
    case E_ListingCategory.ATTIC: {
      securityOptions = [
        E_ListingSecurityOption.ALARM,
        E_ListingSecurityOption.ELECTRONIC_LOCK,
        E_ListingSecurityOption.MONITORING,
        E_ListingSecurityOption.PADLOCK,
        E_ListingSecurityOption.DOOR_LOCK,
        E_ListingSecurityOption.SECURITY,
      ];
      utilityOptions = [E_ListingUtilityOption.ELECTRICITY];
      comfortOptions = [
        E_ListingComfortOption.HEATED,
        E_ListingComfortOption.LIGHTING,
        E_ListingComfortOption.PARKING,
        E_ListingComfortOption.VENTILATION,
      ];
      entryOptions = [
        E_ListingEntryOption.ELEVATOR,
        E_ListingEntryOption.STAIRCASE,
      ];
      usageOptions = [];
      levels = {
        from: 0,
        to: 20,
      };
      conditions = [
        E_ListingCondition.FINISHED,
        E_ListingCondition.NEEDS_RENOVATION,
        E_ListingCondition.NEW,
        E_ListingCondition.PARTIALLY_FINISHED,
        E_ListingCondition.RAW,
      ];
      accessOptions = [
        E_ListingAccess.ACCESS_24H,
        E_ListingAccess.LIMITED_HOURS,
      ];
      break;
    }

    case E_ListingCategory.BASEMENT: {
      securityOptions = [
        E_ListingSecurityOption.ALARM,
        E_ListingSecurityOption.ELECTRONIC_LOCK,
        E_ListingSecurityOption.MONITORING,
        E_ListingSecurityOption.PADLOCK,
        E_ListingSecurityOption.DOOR_LOCK,
        E_ListingSecurityOption.SECURITY,
      ];
      utilityOptions = [E_ListingUtilityOption.ELECTRICITY];
      comfortOptions = [
        E_ListingComfortOption.HEATED,
        E_ListingComfortOption.LIGHTING,
        E_ListingComfortOption.PARKING,
        E_ListingComfortOption.VENTILATION,
      ];
      entryOptions = [
        E_ListingEntryOption.ELEVATOR,
        E_ListingEntryOption.STAIRCASE,
      ];
      usageOptions = [];
      levels = {
        from: -4,
        to: 0,
      };
      conditions = [
        E_ListingCondition.FINISHED,
        E_ListingCondition.NEEDS_RENOVATION,
        E_ListingCondition.NEW,
        E_ListingCondition.PARTIALLY_FINISHED,
        E_ListingCondition.RAW,
      ];
      accessOptions = [
        E_ListingAccess.ACCESS_24H,
        E_ListingAccess.LIMITED_HOURS,
      ];
      break;
    }

    case E_ListingCategory.PARKING: {
      securityOptions = [
        E_ListingSecurityOption.ALARM,
        E_ListingSecurityOption.AUTOMATIC_GATE,
        E_ListingSecurityOption.ELECTRONIC_LOCK,
        E_ListingSecurityOption.MANUAL_GATE,
        E_ListingSecurityOption.MONITORING,
        E_ListingSecurityOption.PADLOCK,
        E_ListingSecurityOption.DOOR_LOCK,
        E_ListingSecurityOption.SECURITY,
        E_ListingSecurityOption.BARRIER,
        E_ListingSecurityOption.REMOTE_CONTROL,
      ];
      utilityOptions = [E_ListingUtilityOption.ELECTRICITY];
      comfortOptions = [E_ListingComfortOption.LIGHTING];
      entryOptions = [];
      usageOptions = [
        E_ListingUsageOptions.CAR_ACCESS,
        E_ListingUsageOptions.TIR_ACCESS,
      ];
      levels = {
        from: -4,
        to: 4,
      };
      conditions = [
        E_ListingCondition.FINISHED,
        E_ListingCondition.NEEDS_RENOVATION,
        E_ListingCondition.NEW,
        E_ListingCondition.RAW,
      ];
      accessOptions = [
        E_ListingAccess.ACCESS_24H,
        E_ListingAccess.LIMITED_HOURS,
      ];
      break;
    }

    case E_ListingCategory.ROOM: {
      securityOptions = [
        E_ListingSecurityOption.ALARM,
        E_ListingSecurityOption.ELECTRONIC_LOCK,
        E_ListingSecurityOption.MONITORING,
        E_ListingSecurityOption.PADLOCK,
        E_ListingSecurityOption.DOOR_LOCK,
      ];
      utilityOptions = [
        E_ListingUtilityOption.ELECTRICITY,
        E_ListingUtilityOption.SEWAGE,
        E_ListingUtilityOption.WATER,
      ];
      comfortOptions = [
        E_ListingComfortOption.HEATED,
        E_ListingComfortOption.LIGHTING,
        E_ListingComfortOption.PARKING,
        E_ListingComfortOption.VENTILATION,
      ];
      entryOptions = [
        E_ListingEntryOption.ELEVATOR,
        E_ListingEntryOption.STAIRCASE,
      ];
      usageOptions = [];
      levels = {
        from: 0,
        to: 20,
      };
      conditions = [
        E_ListingCondition.FINISHED,
        E_ListingCondition.NEEDS_RENOVATION,
        E_ListingCondition.NEW,
        E_ListingCondition.PARTIALLY_FINISHED,
        E_ListingCondition.RAW,
      ];
      accessOptions = [
        E_ListingAccess.ACCESS_24H,
        E_ListingAccess.LIMITED_HOURS,
      ];
      break;
    }

    case E_ListingCategory.STORAGE_UNIT: {
      securityOptions = [
        E_ListingSecurityOption.ALARM,
        E_ListingSecurityOption.ELECTRONIC_LOCK,
        E_ListingSecurityOption.MONITORING,
        E_ListingSecurityOption.PADLOCK,
        E_ListingSecurityOption.DOOR_LOCK,
        E_ListingSecurityOption.SECURITY,
        E_ListingSecurityOption.REMOTE_CONTROL,
      ];
      utilityOptions = [E_ListingUtilityOption.ELECTRICITY];
      comfortOptions = [
        E_ListingComfortOption.HEATED,
        E_ListingComfortOption.LIGHTING,
        E_ListingComfortOption.PARKING,
        E_ListingComfortOption.VENTILATION,
      ];
      entryOptions = [
        E_ListingEntryOption.ELEVATOR,
        E_ListingEntryOption.STAIRCASE,
      ];
      usageOptions = [
        E_ListingUsageOptions.CAR_ACCESS,
        E_ListingUsageOptions.TIR_ACCESS,
      ];
      levels = {
        from: -4,
        to: 20,
      };
      conditions = [
        E_ListingCondition.FINISHED,
        E_ListingCondition.NEEDS_RENOVATION,
        E_ListingCondition.NEW,
        E_ListingCondition.PARTIALLY_FINISHED,
        E_ListingCondition.RAW,
      ];
      accessOptions = [
        E_ListingAccess.ACCESS_24H,
        E_ListingAccess.LIMITED_HOURS,
      ];
      break;
    }

    case E_ListingCategory.BANQUET_HALL: {
      securityOptions = [
        E_ListingSecurityOption.ALARM,
        E_ListingSecurityOption.AUTOMATIC_GATE,
        E_ListingSecurityOption.MONITORING,
        E_ListingSecurityOption.REMOTE_CONTROL,
        E_ListingSecurityOption.SECURITY,
      ];
      utilityOptions = [
        E_ListingUtilityOption.ELECTRICITY,
        E_ListingUtilityOption.SEWAGE,
        E_ListingUtilityOption.WATER,
      ];
      comfortOptions = [
        E_ListingComfortOption.HEATED,
        E_ListingComfortOption.LIGHTING,
        E_ListingComfortOption.PARKING,
        E_ListingComfortOption.VENTILATION,
      ];
      entryOptions = [
        E_ListingEntryOption.ELEVATOR,
        E_ListingEntryOption.STAIRCASE,
      ];
      usageOptions = [
        E_ListingUsageOptions.CAR_ACCESS,
        E_ListingUsageOptions.TIR_ACCESS,
      ];
      levels = {
        from: -1,
        to: 20,
      };
      conditions = [
        E_ListingCondition.FINISHED,
        E_ListingCondition.NEEDS_RENOVATION,
        E_ListingCondition.NEW,
        E_ListingCondition.PARTIALLY_FINISHED,
        E_ListingCondition.RAW,
      ];
      accessOptions = [
        E_ListingAccess.ACCESS_24H,
        E_ListingAccess.LIMITED_HOURS,
      ];
      break;
    }

    case E_ListingCategory.WAREHOUSE: {
      securityOptions = [
        E_ListingSecurityOption.ALARM,
        E_ListingSecurityOption.AUTOMATIC_GATE,
        E_ListingSecurityOption.ELECTRONIC_LOCK,
        E_ListingSecurityOption.MANUAL_GATE,
        E_ListingSecurityOption.MONITORING,
        E_ListingSecurityOption.PADLOCK,
        E_ListingSecurityOption.DOOR_LOCK,
        E_ListingSecurityOption.SECURITY,
        E_ListingSecurityOption.REMOTE_CONTROL,
      ];
      utilityOptions = [
        E_ListingUtilityOption.ELECTRICITY,
        E_ListingUtilityOption.SEWAGE,
        E_ListingUtilityOption.WATER,
      ];
      comfortOptions = [
        E_ListingComfortOption.HEATED,
        E_ListingComfortOption.LIGHTING,
        E_ListingComfortOption.PARKING,
        E_ListingComfortOption.VENTILATION,
      ];
      entryOptions = [
        E_ListingEntryOption.ELEVATOR,
        E_ListingEntryOption.STAIRCASE,
      ];
      usageOptions = [
        E_ListingUsageOptions.CAR_ACCESS,
        E_ListingUsageOptions.TIR_ACCESS,
      ];
      levels = {
        from: -2,
        to: 4,
      };
      conditions = [
        E_ListingCondition.FINISHED,
        E_ListingCondition.NEEDS_RENOVATION,
        E_ListingCondition.NEW,
        E_ListingCondition.PARTIALLY_FINISHED,
        E_ListingCondition.RAW,
      ];
      accessOptions = [
        E_ListingAccess.ACCESS_24H,
        E_ListingAccess.LIMITED_HOURS,
      ];
      break;
    }

    case E_ListingCategory.CONTAINER: {
      securityOptions = [
        E_ListingSecurityOption.ALARM,
        E_ListingSecurityOption.DOOR_LOCK,
        E_ListingSecurityOption.ELECTRONIC_LOCK,
        E_ListingSecurityOption.MONITORING,
        E_ListingSecurityOption.PADLOCK,
      ];
      utilityOptions = [
        E_ListingUtilityOption.ELECTRICITY,
        E_ListingUtilityOption.SEWAGE,
        E_ListingUtilityOption.WATER,
      ];
      comfortOptions = [
        E_ListingComfortOption.HEATED,
        E_ListingComfortOption.LIGHTING,
        E_ListingComfortOption.VENTILATION,
      ];
      entryOptions = [];
      usageOptions = [];
      conditions = [
        E_ListingCondition.FINISHED,
        E_ListingCondition.NEEDS_RENOVATION,
        E_ListingCondition.NEW,
        E_ListingCondition.PARTIALLY_FINISHED,
        E_ListingCondition.RAW,
      ];
      accessOptions = [];
      break;
    }

    case E_ListingCategory.PLOT: {
      securityOptions = [
        E_ListingSecurityOption.ALARM,
        E_ListingSecurityOption.AUTOMATIC_GATE,
        E_ListingSecurityOption.SECURITY,
        E_ListingSecurityOption.MANUAL_GATE,
        E_ListingSecurityOption.MONITORING,
        E_ListingSecurityOption.PADLOCK,
        E_ListingSecurityOption.REMOTE_CONTROL,
      ];
      utilityOptions = [
        E_ListingUtilityOption.ELECTRICITY,
        E_ListingUtilityOption.SEWAGE,
        E_ListingUtilityOption.WATER,
      ];
      comfortOptions = [
        E_ListingComfortOption.LIGHTING,
        E_ListingComfortOption.PARKING,
      ];
      entryOptions = [];
      usageOptions = [
        E_ListingUsageOptions.CAR_ACCESS,
        E_ListingUsageOptions.TIR_ACCESS,
      ];
      conditions = [
        E_ListingCondition.FINISHED,
        E_ListingCondition.NEEDS_RENOVATION,
        E_ListingCondition.NEW,
        E_ListingCondition.PARTIALLY_FINISHED,
        E_ListingCondition.RAW,
      ];
      accessOptions = [];
      break;
    }

    case E_ListingCategory.UNIT: {
      securityOptions = [
        E_ListingSecurityOption.ALARM,
        E_ListingSecurityOption.DOOR_LOCK,
        E_ListingSecurityOption.ELECTRONIC_LOCK,
        E_ListingSecurityOption.MONITORING,
        E_ListingSecurityOption.PADLOCK,
        E_ListingSecurityOption.SECURITY,
      ];
      utilityOptions = [
        E_ListingUtilityOption.ELECTRICITY,
        E_ListingUtilityOption.SEWAGE,
        E_ListingUtilityOption.WATER,
      ];
      comfortOptions = [
        E_ListingComfortOption.HEATED,
        E_ListingComfortOption.LIGHTING,
        E_ListingComfortOption.PARKING,
        E_ListingComfortOption.VENTILATION,
      ];
      entryOptions = [
        E_ListingEntryOption.ELEVATOR,
        E_ListingEntryOption.STAIRCASE,
        E_ListingEntryOption.STREET_ENTRANCE,
      ];
      usageOptions = [];
      levels = {
        from: -2,
        to: 10,
      };
      conditions = [
        E_ListingCondition.FINISHED,
        E_ListingCondition.NEEDS_RENOVATION,
        E_ListingCondition.NEW,
        E_ListingCondition.PARTIALLY_FINISHED,
        E_ListingCondition.RAW,
      ];
      accessOptions = [
        E_ListingAccess.ACCESS_24H,
        E_ListingAccess.LIMITED_HOURS,
      ];
      break;
    }

    default: {
      securityOptions = [];
      comfortOptions = [];
      entryOptions = [];
      usageOptions = [];
      utilityOptions = [];
      conditions = [];
      accessOptions = [];
      break;
    }
  }

  return {
    accessOptions,
    comfortOptions,
    conditions,
    entryOptions,
    levels,
    securityOptions,
    usageOptions,
    utilityOptions,
  };
};

export const generateIconForListingCategory = ({
  category,
  t,
}: {
  category: null | T_ListingCategory;
  t: TFunction<"seo", undefined>;
}): {
  alt: string;
  icon?: IconDefinition;
  src?: string;
} => {
  switch (category) {
    case E_ListingCategory.PLOT: {
      return {
        alt: t("imagesAlt.iconLocationDot"),
        icon: faLocationDot,
      };
    }
    case E_ListingCategory.CONTAINER: {
      return {
        alt: t("imagesAlt.iconBox"),
        icon: faBox,
      };
    }
    case E_ListingCategory.ATTIC: {
      return {
        alt: t("imagesAlt.iconAttic"),
        src: "/icons/attic",
      };
    }
    case E_ListingCategory.PARKING: {
      return {
        alt: t("imagesAlt.iconSquareParking"),
        icon: faSquareParking,
      };
    }
    case E_ListingCategory.BASEMENT: {
      return {
        alt: t("imagesAlt.iconTableCellsColumnLock"),
        icon: faTableCellsColumnLock,
      };
    }
    case E_ListingCategory.STORAGE_UNIT: {
      return {
        alt: t("imagesAlt.iconBuildingLock"),
        icon: faBuildingLock,
      };
    }
    case E_ListingCategory.BANQUET_HALL: {
      return {
        alt: t("imagesAlt.iconHotel"),
        icon: faHotel,
      };
    }
    case E_ListingCategory.ROOM: {
      return {
        alt: t("imagesAlt.iconHouse"),
        icon: faHouse,
      };
    }
    case E_ListingCategory.WAREHOUSE: {
      return {
        alt: t("imagesAlt.iconWarehouse"),
        icon: faWarehouse,
      };
    }
    case E_ListingCategory.UNIT: {
      return {
        alt: t("imagesAlt.iconBriefcase"),
        icon: faBriefcase,
      };
    }

    default: {
      return {
        alt: t("imagesAlt.iconLayerGroup"),
        icon: faLayerGroup,
      };
    }
  }
};

export const generateIconForListingParkingType = ({
  parkingType,
  t,
}: {
  parkingType: null | T_ListingParkingType;
  t: TFunction<"seo", undefined>;
}): {
  alt: string;
  icon?: IconDefinition;
  src?: string;
} => {
  switch (parkingType) {
    case E_ListingParkingType.DETACHED: {
      return {
        alt: t("imagesAlt.iconParkingDetached"),
        src: "/icons/parkingDetached",
      };
    }
    case E_ListingParkingType.GROUND_PLACE: {
      return {
        alt: t("imagesAlt.iconParkingGroundPlace"),
        src: "/icons/parkingGroundPlace",
      };
    }
    case E_ListingParkingType.MULTILEVEL_LIFT: {
      return {
        alt: t("imagesAlt.iconParkingMultilevel"),
        src: "/icons/parkingMultilevel",
      };
    }
    case E_ListingParkingType.UNDERGROUND: {
      return {
        alt: t("imagesAlt.iconParkingUnderground"),
        src: "/icons/parkingUnderground",
      };
    }

    default: {
      return {
        alt: t("imagesAlt.iconSquareParking"),
        icon: faSquareParking,
      };
    }
  }
};

type T_GenerateExtraQueryToSearch = {
  searchListing: T_SearchListingProperties;
};

export const generateExtraQueryToSearch = ({
  searchListing,
}: T_GenerateExtraQueryToSearch) => {
  let validAvailableFrom = false;
  if (searchListing.calendar.availableFrom) {
    const isValidDate = isTodayOrFuture({
      isoDate: searchListing.calendar.availableFrom,
    });

    if (isValidDate) {
      validAvailableFrom = true;
    }
  }

  const isValidDistrictInCity = Boolean(
    searchListing.location.district && searchListing.location.city,
  );

  return {
    ...(searchListing.categoryAndFilters.parkingTypes.length > 0
      ? {
          [formNames.listingParkingTypes]:
            searchListing.categoryAndFilters.parkingTypes,
        }
      : {}),
    ...(searchListing.categoryAndFilters.plotTypes.length > 0
      ? {
          [formNames.listingPlotTypes]:
            searchListing.categoryAndFilters.plotTypes,
        }
      : {}),
    ...(searchListing.categoryAndFilters.unitTypes.length > 0
      ? {
          [formNames.listingUnitTypes]:
            searchListing.categoryAndFilters.unitTypes,
        }
      : {}),
    ...(searchListing.categoryAndFilters.containerTypes.length > 0
      ? {
          [formNames.listingContainerTypes]:
            searchListing.categoryAndFilters.containerTypes,
        }
      : {}),
    ...(searchListing.categoryAndFilters.condition
      ? {
          [formNames.listingCondition]:
            searchListing.categoryAndFilters.condition.toString(),
        }
      : {}),
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
    ...(searchListing.calendar.availableFrom && validAvailableFrom
      ? {
          [formNames.listingAvailableFrom]: dayjs(
            searchListing.calendar.availableFrom,
          ).format("YYYY-MM-DD"),
        }
      : {}),
    ...(searchListing.calendar.shortTerm &&
    searchListing.extraFilters.type === E_ListingType.RENT
      ? {
          [formNames.listingShortTerm]:
            searchListing.calendar.shortTerm.toString(),
        }
      : {}),
    ...(searchListing.calendar.longTerm &&
    searchListing.extraFilters.type === E_ListingType.RENT
      ? {
          [formNames.listingLongTerm]:
            searchListing.calendar.longTerm.toString(),
        }
      : {}),
    ...(searchListing.calendar.shortTerm &&
    searchListing.calendar.rentalDays &&
    searchListing.extraFilters.type === E_ListingType.RENT
      ? {
          [formNames.listingRentalDays]:
            searchListing.calendar.rentalDays.toString(),
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
  };
};

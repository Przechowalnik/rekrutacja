import { faSquareMinus, faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { Box, DefaultMantineColor, Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import {
  T_SearchListingProperties,
  T_SearchListingsCategoryAndFilters,
  T_SearchListingsExtraFilters,
  T_SearchListingsLocation,
} from "~/context/SearchListingsContext";
import {
  allListingAccess,
  allListingConditions,
  allListingContractType,
  allListingType,
  E_ListingCategory,
  T_LocationRadius,
} from "~/models/enums";
import { Button } from "~/ui/Button";
import { Collapse } from "~/ui/Collapse";
import { Fieldset } from "~/ui/Fieldset";
import { IconSeo } from "~/ui/IconSeo";
import { SelectLocationRange } from "~/ui/SelectLocationRange";
import { Tooltip } from "~/ui/Tooltip";
import { isNumber } from "~/utilities/functions";
import { sortArray } from "~/utilities/sort";

import {
  FIELDSET_FONT_SIZE,
  FIELDSET_GAP,
} from "../SearchListingsFiltersSection";

type T_SearchListingsFiltersExtraFilters = {
  barExtraFiltersOpened: boolean;
  handleSaveNewCategoryAndFilters: (
    properties: T_SearchListingsCategoryAndFilters,
  ) => void;
  handleSaveNewExtraFilters: (properties: T_SearchListingsExtraFilters) => void;
  handleSaveNewLocation: (properties: T_SearchListingsLocation) => void;
  platformColor: DefaultMantineColor;
  searchListing: T_SearchListingProperties;
};

export const SearchListingsFiltersExtraFilters = ({
  barExtraFiltersOpened,
  handleSaveNewCategoryAndFilters,
  handleSaveNewExtraFilters,
  handleSaveNewLocation,
  platformColor,
  searchListing,
}: T_SearchListingsFiltersExtraFilters) => {
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);

  const validCondition =
    searchListing.categoryAndFilters.category &&
    (searchListing.categoryAndFilters.category === E_ListingCategory.ROOM ||
      searchListing.categoryAndFilters.category === E_ListingCategory.ATTIC ||
      searchListing.categoryAndFilters.category ===
        E_ListingCategory.BASEMENT ||
      searchListing.categoryAndFilters.category ===
        E_ListingCategory.WAREHOUSE ||
      searchListing.categoryAndFilters.category === E_ListingCategory.UNIT);

  const validAccess =
    searchListing.categoryAndFilters.category &&
    (searchListing.categoryAndFilters.category === E_ListingCategory.ATTIC ||
      searchListing.categoryAndFilters.category ===
        E_ListingCategory.BASEMENT ||
      searchListing.categoryAndFilters.category === E_ListingCategory.PARKING ||
      searchListing.categoryAndFilters.category === E_ListingCategory.ROOM ||
      searchListing.categoryAndFilters.category ===
        E_ListingCategory.STORAGE_UNIT ||
      searchListing.categoryAndFilters.category === E_ListingCategory.UNIT ||
      searchListing.categoryAndFilters.category ===
        E_ListingCategory.WAREHOUSE ||
      searchListing.categoryAndFilters.category ===
        E_ListingCategory.BANQUET_HALL);

  const mapListingContractTypes = sortArray({
    array: allListingContractType,
    sort: "DESC",
  }).map(item => {
    const isActive = searchListing.extraFilters.contractType === item;

    return (
      <Button
        bg={
          isActive
            ? platformColor
            : `light-dark(${colorsMantine.gray2}, ${colorsMantine.dark6})`
        }
        c={
          isActive
            ? colorsMantine.white
            : `light-dark(${colorsMantine.black}, ${colorsMantine.white})`
        }
        key={`contractType_${item}`}
        leftSection={
          <IconSeo icon={isActive ? faSquarePlus : faSquareMinus} size="lg" />
        }
        onClick={() => {
          handleSaveNewExtraFilters({
            access: searchListing.extraFilters.access,
            contractType: isActive ? null : item,
            type: searchListing.extraFilters.type,
          });
        }}
        size="sm"
        variant="filled"
        w="auto"
      >
        {tCommon(`listingContractType.${item}`)}
      </Button>
    );
  });

  const mapListingAccess = sortArray({
    array: allListingAccess,
    sort: "DESC",
  }).map(item => {
    const isActive = searchListing.extraFilters.access === item;

    return (
      <Button
        bg={
          isActive
            ? platformColor
            : `light-dark(${colorsMantine.gray2}, ${colorsMantine.dark6})`
        }
        c={
          isActive
            ? colorsMantine.white
            : `light-dark(${colorsMantine.black}, ${colorsMantine.white})`
        }
        key={`access_${item}`}
        leftSection={
          <IconSeo icon={isActive ? faSquarePlus : faSquareMinus} size="lg" />
        }
        onClick={() => {
          handleSaveNewExtraFilters({
            access: isActive ? null : item,
            contractType: searchListing.extraFilters.contractType,
            type: searchListing.extraFilters.type,
          });
        }}
        size="sm"
        variant="filled"
        w="auto"
      >
        {tCommon(`listingAccess.${item}`)}
      </Button>
    );
  });

  const mapListingCondition = sortArray({
    array: allListingConditions,
    sort: "DESC",
  }).map(item => {
    const isActive = searchListing.categoryAndFilters?.condition === item;

    return (
      <Button
        bg={
          isActive
            ? platformColor
            : `light-dark(${colorsMantine.gray2}, ${colorsMantine.dark6})`
        }
        c={
          isActive
            ? colorsMantine.white
            : `light-dark(${colorsMantine.black}, ${colorsMantine.white})`
        }
        key={`condition_${item}`}
        leftSection={
          <IconSeo icon={isActive ? faSquarePlus : faSquareMinus} size="lg" />
        }
        onClick={() => {
          handleSaveNewCategoryAndFilters({
            category: searchListing.categoryAndFilters.category,
            condition: isActive ? null : item,
            containerTypes: searchListing.categoryAndFilters.containerTypes,
            parkingTypes: searchListing.categoryAndFilters.parkingTypes,
            plotTypes: searchListing.categoryAndFilters.plotTypes,
            unitTypes: searchListing.categoryAndFilters.unitTypes,
          });
        }}
        size="sm"
        variant="filled"
        w="auto"
      >
        {tCommon(`listingCondition.${item}`)}
      </Button>
    );
  });

  const mapListingTypes = [...allListingType]
    .sort((a, b) =>
      tCommon(`listingType.${a}`).localeCompare(
        tCommon(`listingType.${b}`),
        "pl",
        { sensitivity: "base" },
      ),
    )
    .map(item => {
      const isActive = searchListing.extraFilters.type === item;

      return (
        <Button
          bg={
            isActive
              ? platformColor
              : `light-dark(${colorsMantine.gray2}, ${colorsMantine.dark6})`
          }
          c={
            isActive
              ? colorsMantine.white
              : `light-dark(${colorsMantine.black}, ${colorsMantine.white})`
          }
          key={`type_${item}`}
          onClick={() => {
            if (searchListing.categoryAndFilters.category) {
              notifications.show({
                color: "yellow",
                message: tNotifications("listingTypeChangeAlert.message"),
                title: tNotifications("listingTypeChangeAlert.title"),
              });
            }

            handleSaveNewExtraFilters({
              access: searchListing.extraFilters.access,
              contractType: searchListing.extraFilters.contractType,
              type: isActive ? null : item,
            });
            handleSaveNewCategoryAndFilters({
              category: null,
              condition: searchListing.categoryAndFilters.condition,
              containerTypes: [],
              parkingTypes: [],
              plotTypes: [],
              unitTypes: [],
            });
          }}
          size="sm"
          variant="filled"
          w="auto"
        >
          {tCommon(`listingType.${item}`)}
        </Button>
      );
    });

  const contentCondition = (
    <Box pt={24}>
      <Fieldset
        fontSize={FIELDSET_FONT_SIZE}
        legend={tCommon("inputs.listingCondition")}
        withInputWrapper={false}
      >
        <Flex align="center" gap={12} justify="flex-start" wrap="wrap">
          {mapListingCondition}
        </Flex>
      </Fieldset>
    </Box>
  );

  const contentAccess = (
    <Box pt={24}>
      <Fieldset
        fontSize={FIELDSET_FONT_SIZE}
        legend={tCommon("inputs.listingAccess")}
        withInputWrapper={false}
      >
        <Flex align="center" gap={12} justify="flex-start" wrap="wrap">
          {mapListingAccess}
        </Flex>
      </Fieldset>
    </Box>
  );

  return (
    <Box pb={24} pt={12} px={24}>
      <Fieldset
        fontSize={FIELDSET_FONT_SIZE}
        legend={tCommon("navigation.header.location")}
        withInputWrapper
      >
        <Box w="100%">
          <Tooltip
            disabled={
              !!searchListing.location.city && !searchListing.location.district
            }
            fullWidth
            label={
              searchListing.location.district
                ? tCommon(
                    "selectListingCityDistrict.tooltipRadiusUnavailableWithDistrict",
                  )
                : tCommon(
                    "selectListingCityDistrict.tooltipNoSelectedCityForRadius",
                  )
            }
            withCursorNotAllowed={false}
          >
            <SelectLocationRange
              disabled={
                !searchListing.location.city ||
                !!searchListing.location.district
              }
              onChange={newValue => {
                handleSaveNewLocation({
                  city: searchListing.location.city,
                  district: searchListing.location.district,
                  radius: isNumber(newValue)
                    ? (Number(newValue) as T_LocationRadius)
                    : null,
                });
              }}
              pointerEventsForTooltipOnDisabled
              required={false}
              size="md"
              value={searchListing.location.radius}
            />
          </Tooltip>
        </Box>
      </Fieldset>
      <Flex
        align="flex-start"
        direction={{
          base: "column",
          sm: "row",
        }}
        gap={FIELDSET_GAP}
        justify="flex-start"
        pb={24}
        pt={24}
      >
        <Fieldset
          fontSize={FIELDSET_FONT_SIZE}
          legend={tCommon("inputs.listingType")}
          withInputWrapper={false}
        >
          <Flex align="center" gap={12} justify="flex-start" wrap="wrap">
            {mapListingTypes}
          </Flex>
        </Fieldset>
      </Flex>
      <Fieldset
        description={tCommon("inputsDescription.listingContractType")}
        fontSize={FIELDSET_FONT_SIZE}
        legend={tCommon("inputs.listingContractType")}
        withInputWrapper={false}
      >
        <Flex align="center" gap={12} justify="flex-start" wrap="wrap">
          {mapListingContractTypes}
        </Flex>
      </Fieldset>
      {barExtraFiltersOpened ? (
        <Collapse opened={!!validAccess}>{contentAccess}</Collapse>
      ) : (
        validAccess && contentAccess
      )}
      {barExtraFiltersOpened ? (
        <Collapse opened={!!validCondition}>{contentCondition}</Collapse>
      ) : (
        validCondition && contentCondition
      )}
    </Box>
  );
};

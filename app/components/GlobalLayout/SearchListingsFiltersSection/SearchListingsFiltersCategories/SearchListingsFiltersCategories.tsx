import { faSquareMinus, faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { Box, DefaultMantineColor, Flex } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import {
  T_SearchListingProperties,
  T_SearchListingsCategoryAndFilters,
} from "~/context/SearchListingsContext";
import {
  allListingContainerType,
  allListingParkingType,
  allListingPlotTypes,
  allListingPlotTypesRent,
  allListingPlotTypesSale,
  allListingUnitTypes,
  E_ListingCategory,
  E_ListingType,
  isInListingPlotTypes,
  isInListingPlotTypesRent,
  isInListingPlotTypesSale,
  T_ListingPlotType,
} from "~/models/enums";
import { Button } from "~/ui/Button";
import { Collapse } from "~/ui/Collapse";
import { Fieldset } from "~/ui/Fieldset";
import { IconSeo } from "~/ui/IconSeo";

import { FIELDSET_FONT_SIZE } from "../SearchListingsFiltersSection";

type T_SearchListingsFiltersCategories = {
  handleSaveNewCategoryAndFilters: (
    properties: T_SearchListingsCategoryAndFilters,
  ) => void;
  platformColor: DefaultMantineColor;
  searchListing: T_SearchListingProperties;
};

export const SearchListingsFiltersCategories = ({
  handleSaveNewCategoryAndFilters,
  platformColor,
  searchListing,
}: T_SearchListingsFiltersCategories) => {
  const { t: tCommon } = useTranslation(namespaces.common);

  const onClickSavePlotFilters = (newPlots: T_ListingPlotType[]) => {
    if (searchListing.categoryAndFilters.category !== E_ListingCategory.PLOT) {
      return;
    }

    let isCorrectValue: boolean;

    if (!searchListing.extraFilters.type) {
      isCorrectValue = newPlots.every(item => isInListingPlotTypes(item));
    } else if (searchListing.extraFilters.type === E_ListingType.RENT) {
      isCorrectValue = newPlots.every(item => isInListingPlotTypesRent(item));
    } else {
      isCorrectValue = newPlots.every(item => isInListingPlotTypesSale(item));
    }

    handleSaveNewCategoryAndFilters({
      category: E_ListingCategory.PLOT,
      condition: null,
      containerTypes: [],
      parkingTypes: [],
      plotTypes: isCorrectValue ? newPlots : [],
      unitTypes: [],
    });
  };

  const mapParkingTypes = [...allListingParkingType]
    .sort((a, b) =>
      tCommon(`listingParkingType.${a}`).localeCompare(
        tCommon(`listingParkingType.${b}`),
        "pl",
        { sensitivity: "base" },
      ),
    )
    .map(item => {
      const isActive =
        searchListing.categoryAndFilters.parkingTypes.includes(item);

      const newParkingValueToUpdate = isActive
        ? searchListing.categoryAndFilters.parkingTypes.filter(
            itemParkingType => itemParkingType !== item,
          )
        : [...searchListing.categoryAndFilters.parkingTypes, item];

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
          key={`parkingType_${item}`}
          leftSection={
            <IconSeo icon={isActive ? faSquarePlus : faSquareMinus} size="lg" />
          }
          onClick={() => {
            if (
              searchListing.categoryAndFilters.category !==
              E_ListingCategory.PARKING
            ) {
              return;
            }

            handleSaveNewCategoryAndFilters({
              category: E_ListingCategory.PARKING,
              condition: null,
              containerTypes: [],
              parkingTypes: newParkingValueToUpdate,
              plotTypes: [],
              unitTypes: [],
            });
          }}
          size="sm"
          variant="filled"
          w="auto"
        >
          {tCommon(`listingParkingType.${item}`)}
        </Button>
      );
    });

  const mapContainerTypes = [...allListingContainerType]
    .sort((a, b) =>
      tCommon(`listingContainerType.${a}`).localeCompare(
        tCommon(`listingContainerType.${b}`),
        "pl",
        { sensitivity: "base" },
      ),
    )
    .map(item => {
      const isActive =
        searchListing.categoryAndFilters.containerTypes.includes(item);

      const newContainerValueToUpdate = isActive
        ? searchListing.categoryAndFilters.containerTypes.filter(
            itemContainerType => itemContainerType !== item,
          )
        : [...searchListing.categoryAndFilters.containerTypes, item];

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
          key={`containerType_${item}`}
          leftSection={
            <IconSeo icon={isActive ? faSquarePlus : faSquareMinus} size="lg" />
          }
          onClick={() => {
            if (
              searchListing.categoryAndFilters.category !==
              E_ListingCategory.CONTAINER
            ) {
              return;
            }

            handleSaveNewCategoryAndFilters({
              category: E_ListingCategory.CONTAINER,
              condition: null,
              containerTypes: newContainerValueToUpdate,
              parkingTypes: [],
              plotTypes: [],
              unitTypes: [],
            });
          }}
          size="sm"
          variant="filled"
          w="auto"
        >
          {tCommon(`listingContainerType.${item}`)}
        </Button>
      );
    });

  let plotTypes: typeof allListingPlotTypes;

  if (!searchListing.extraFilters.type) {
    plotTypes = allListingPlotTypes;
  } else if (searchListing.extraFilters.type === E_ListingType.SALE) {
    plotTypes = allListingPlotTypesSale;
  } else {
    plotTypes = allListingPlotTypesRent;
  }

  const mapPlotTypes = [...plotTypes]
    .sort((a, b) =>
      tCommon(`listingPlotType.${a}`).localeCompare(
        tCommon(`listingPlotType.${b}`),
        "pl",
        { sensitivity: "base" },
      ),
    )
    .map(item => {
      const isActive =
        searchListing.categoryAndFilters.plotTypes.includes(item);

      const newPlotValueToUpdate = isActive
        ? searchListing.categoryAndFilters.plotTypes.filter(
            itemPlotType => itemPlotType !== item,
          )
        : [...searchListing.categoryAndFilters.plotTypes, item];

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
          key={`plotType_${item}`}
          leftSection={
            <IconSeo icon={isActive ? faSquarePlus : faSquareMinus} size="lg" />
          }
          onClick={() => onClickSavePlotFilters(newPlotValueToUpdate)}
          size="sm"
          variant="filled"
          w="auto"
        >
          {tCommon(`listingPlotType.${item}`)}
        </Button>
      );
    });

  const mapUnitTypes = [...allListingUnitTypes]
    .sort((a, b) =>
      tCommon(`listingUnitType.${a}`).localeCompare(
        tCommon(`listingUnitType.${b}`),
        "pl",
        { sensitivity: "base" },
      ),
    )
    .map(item => {
      const isActive =
        searchListing.categoryAndFilters.unitTypes.includes(item);

      const newUnitValueToUpdate = isActive
        ? searchListing.categoryAndFilters.unitTypes.filter(
            itemUnitType => itemUnitType !== item,
          )
        : [...searchListing.categoryAndFilters.unitTypes, item];

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
          key={`unitType_${item}`}
          leftSection={
            <IconSeo icon={isActive ? faSquarePlus : faSquareMinus} size="lg" />
          }
          onClick={() => {
            if (
              searchListing.categoryAndFilters.category !==
              E_ListingCategory.UNIT
            ) {
              return;
            }

            handleSaveNewCategoryAndFilters({
              category: E_ListingCategory.UNIT,
              condition: null,
              containerTypes: [],
              parkingTypes: [],
              plotTypes: [],
              unitTypes: newUnitValueToUpdate,
            });
          }}
          size="sm"
          variant="filled"
          w="auto"
        >
          {tCommon(`listingUnitType.${item}`)}
        </Button>
      );
    });

  const contentParkingTypes = (
    <Box pt={12}>
      <Fieldset
        fontSize={FIELDSET_FONT_SIZE}
        fullHeight
        legend={tCommon("inputs.listingParkingTypes")}
        withInputWrapper={false}
      >
        <Flex align="center" gap={12} justify="flex-start" wrap="wrap">
          {mapParkingTypes}
        </Flex>
      </Fieldset>
    </Box>
  );

  const contentContainerTypes = (
    <Box pt={12}>
      <Fieldset
        fontSize={FIELDSET_FONT_SIZE}
        fullHeight
        legend={tCommon("inputs.listingContainerTypes")}
        withInputWrapper={false}
      >
        <Flex align="center" gap={12} justify="flex-start" wrap="wrap">
          {mapContainerTypes}
        </Flex>
      </Fieldset>
    </Box>
  );

  const contentPlotTypes = (
    <Box pt={12}>
      <Fieldset
        fontSize={FIELDSET_FONT_SIZE}
        fullHeight
        legend={tCommon("inputs.listingPlotTypes")}
        withInputWrapper={false}
      >
        <Flex align="center" gap={12} justify="flex-start" wrap="wrap">
          {mapPlotTypes}
        </Flex>
      </Fieldset>
    </Box>
  );
  const contentUnitTypes = (
    <Box pt={12}>
      <Fieldset
        fontSize={FIELDSET_FONT_SIZE}
        fullHeight
        legend={tCommon("inputs.listingUnitTypes")}
        withInputWrapper={false}
      >
        <Flex align="center" gap={12} justify="flex-start" wrap="wrap">
          {mapUnitTypes}
        </Flex>
      </Fieldset>
    </Box>
  );

  return (
    <Box>
      <Collapse
        opened={
          searchListing.categoryAndFilters.category ===
          E_ListingCategory.PARKING
        }
      >
        {contentParkingTypes}
      </Collapse>
      <Collapse
        opened={
          searchListing.categoryAndFilters.category ===
          E_ListingCategory.CONTAINER
        }
      >
        {contentContainerTypes}
      </Collapse>
      <Collapse
        opened={
          searchListing.categoryAndFilters.category === E_ListingCategory.PLOT
        }
      >
        {contentPlotTypes}
      </Collapse>
      <Collapse
        opened={
          searchListing.categoryAndFilters.category === E_ListingCategory.UNIT
        }
      >
        {contentUnitTypes}
      </Collapse>
    </Box>
  );
};

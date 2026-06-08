import { faSquareMinus, faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { Box, DefaultMantineColor, Flex } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import {
  T_SearchListingProperties,
  T_SearchListingsExtraFilters,
  T_SearchListingsLocation,
} from "~/context/SearchListingsContext";
import { allWorkMode, T_LocationRadius } from "~/models/enums";
import { Button } from "~/ui/Button";
import { Fieldset } from "~/ui/Fieldset";
import { IconSeo } from "~/ui/IconSeo";
import { SelectLocationRange } from "~/ui/SelectLocationRange";
import { Tooltip } from "~/ui/Tooltip";
import { isNumber } from "~/utilities/functions";

import { FIELDSET_FONT_SIZE } from "../SearchListingsFiltersSection";

type T_SearchListingsFiltersExtraFilters = {
  handleSaveNewExtraFilters: (properties: T_SearchListingsExtraFilters) => void;
  handleSaveNewLocation: (properties: T_SearchListingsLocation) => void;
  platformColor: DefaultMantineColor;
  searchListing: T_SearchListingProperties;
};

export const SearchListingsFiltersExtraFilters = ({
  handleSaveNewExtraFilters,
  handleSaveNewLocation,
  platformColor,
  searchListing,
}: T_SearchListingsFiltersExtraFilters) => {
  const { t: tCommon } = useTranslation(namespaces.common);

  const mapWorkModes = [...allWorkMode].map(item => {
    const isActive = searchListing.extraFilters.workModes.includes(item);

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
        key={`workMode_${item}`}
        leftSection={
          <IconSeo icon={isActive ? faSquarePlus : faSquareMinus} size="lg" />
        }
        onClick={() => {
          handleSaveNewExtraFilters({
            workModes: isActive
              ? searchListing.extraFilters.workModes.filter(w => w !== item)
              : [...searchListing.extraFilters.workModes, item],
          });
        }}
        size="sm"
        variant="filled"
        w="auto"
      >
        {tCommon(`workMode.${item}`)}
      </Button>
    );
  });

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
      <Fieldset
        fontSize={FIELDSET_FONT_SIZE}
        legend={tCommon("inputs.listingWorkMode")}
        withInputWrapper={false}
      >
        <Flex
          align="center"
          gap={12}
          justify="flex-start"
          pt={24}
          wrap="wrap"
        >
          {mapWorkModes}
        </Flex>
      </Fieldset>
    </Box>
  );
};

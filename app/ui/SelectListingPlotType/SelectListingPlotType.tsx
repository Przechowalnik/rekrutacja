import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingPlotTypes,
  allListingPlotTypesRent,
  allListingPlotTypesSale,
  E_ListingPlotType,
  E_ListingType,
  T_ListingType,
} from "~/models/enums";

import { Select } from "../Select";

type T_SelectListingPlotType = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  listingType?: T_ListingType;
  required?: boolean;
};

const SelectListingPlotType = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  listingType,
  required,
}: T_SelectListingPlotType) => {
  const { t } = useTranslation(namespaces.common);

  const plotTypes = (() => {
    if (!listingType) {
      return allListingPlotTypes;
    }
    if (listingType === E_ListingType.SALE) {
      return allListingPlotTypesSale;
    }
    return allListingPlotTypesRent;
  })();

  const mapListingPlotType = [...plotTypes]
    .sort((a, b) =>
      t(`listingPlotType.${a}`).localeCompare(t(`listingPlotType.${b}`), "pl", {
        sensitivity: "base",
      }),
    )
    .map(item => {
      return {
        label: `${t(`listingPlotType.${item}`)}`,
        value: E_ListingPlotType[item],
      };
    });

  return (
    <Select
      allowDeselect={false}
      clearable={false}
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.listingPlotType) : undefined}
      label={label}
      name={formNames.listingPlotType}
      options={mapListingPlotType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingPlotType),
          }
        : {})}
    />
  );
};

export default memo(SelectListingPlotType);

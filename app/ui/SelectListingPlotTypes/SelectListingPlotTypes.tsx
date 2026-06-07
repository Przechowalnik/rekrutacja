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
  T_ListingPlotType,
  T_ListingType,
} from "~/models/enums";

import { SelectMultipleBadge } from "../SelectMultipleBadge";

type T_SelectListingPlotTypes = {
  defaultValues?: T_ListingPlotType[];
  description?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  listingType?: T_ListingType;
  required?: boolean;
};

const SelectListingPlotTypes = ({
  defaultValues,
  description,
  disabled,
  form,
  label,
  listingType,
  required,
}: T_SelectListingPlotTypes) => {
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
    <SelectMultipleBadge
      defaultValue={defaultValues}
      description={description}
      disabled={disabled}
      key={form ? form.key(formNames.listingPlotTypes) : undefined}
      label={label}
      name={formNames.listingPlotTypes}
      options={mapListingPlotType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingPlotTypes),
          }
        : {})}
    />
  );
};

export default memo(SelectListingPlotTypes);

import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingUnitTypes,
  E_ListingUnitType,
  T_ListingUnitType,
} from "~/models/enums";

import { SelectMultipleBadge } from "../SelectMultipleBadge";

type T_SelectListingUnitTypes = {
  defaultValues?: T_ListingUnitType[];
  description?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

const SelectListingUnitTypes = ({
  defaultValues,
  description,
  disabled,
  form,
  label,
  required,
}: T_SelectListingUnitTypes) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingUnitType = [...allListingUnitTypes]
    .sort((a, b) =>
      t(`listingUnitType.${a}`).localeCompare(t(`listingUnitType.${b}`), "pl", {
        sensitivity: "base",
      }),
    )
    .map(item => {
      return {
        label: `${t(`listingUnitType.${item}`)}`,
        value: E_ListingUnitType[item],
      };
    });

  return (
    <SelectMultipleBadge
      defaultValue={defaultValues}
      description={description}
      disabled={disabled}
      key={form ? form.key(formNames.listingUnitTypes) : undefined}
      label={label}
      name={formNames.listingUnitTypes}
      options={mapListingUnitType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingUnitTypes),
          }
        : {})}
    />
  );
};

export default memo(SelectListingUnitTypes);

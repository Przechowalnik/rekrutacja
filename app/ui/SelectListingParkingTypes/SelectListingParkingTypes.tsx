import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingParkingType,
  E_ListingParkingType,
  T_ListingParkingType,
} from "~/models/enums";

import { SelectMultipleBadge } from "../SelectMultipleBadge";

type T_SelectListingParkingTypes = {
  defaultValues?: T_ListingParkingType[];
  description?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

const SelectListingParkingTypes = ({
  defaultValues,
  description,
  disabled,
  form,
  label,
  required,
}: T_SelectListingParkingTypes) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingGaragesType = [...allListingParkingType]
    .sort((a, b) =>
      t(`listingParkingType.${a}`).localeCompare(
        t(`listingParkingType.${b}`),
        "pl",
        {
          sensitivity: "base",
        },
      ),
    )
    .map(item => {
      return {
        label: `${t(`listingParkingType.${item}`)}`,
        value: E_ListingParkingType[item],
      };
    });

  return (
    <SelectMultipleBadge
      defaultValue={defaultValues}
      description={description}
      disabled={disabled}
      key={form ? form.key(formNames.listingParkingTypes) : undefined}
      label={label}
      name={formNames.listingParkingTypes}
      options={mapListingGaragesType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingParkingTypes),
          }
        : {})}
    />
  );
};

export default memo(SelectListingParkingTypes);

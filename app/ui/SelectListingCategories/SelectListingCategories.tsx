/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoxProps } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingCategoryRent,
  E_ListingCategory,
  T_ListingCategory,
} from "~/models/enums";

import { SelectMultipleBadge } from "../SelectMultipleBadge";

type T_SelectListingCategories = {
  defaultValues?: T_ListingCategory[];
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
} & BoxProps;

const SelectListingCategories = ({
  defaultValues,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
  ...restProps
}: T_SelectListingCategories) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingCategories = [...allListingCategoryRent]
    .sort((a, b) =>
      t(`listingCategory.${a}`).localeCompare(t(`listingCategory.${b}`), "pl", {
        sensitivity: "base",
      }),
    )
    .map(item => {
      return {
        label: `${t(`listingCategory.${item}`)}`,
        value: E_ListingCategory[item],
      };
    });

  return (
    <SelectMultipleBadge
      defaultValue={defaultValues}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.listingCategories) : undefined}
      label={label}
      name={formNames.listingCategories}
      options={mapListingCategories}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingCategories),
          }
        : {})}
      {...restProps}
    />
  );
};

export default SelectListingCategories;

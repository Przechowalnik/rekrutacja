/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoxProps } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allListingCategory, E_ListingCategory } from "~/models/enums";

import { Select, T_SelectVariant } from "../Select";

type T_SelectListingCategory = {
  allowDeselect?: boolean;
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  form?: UseFormReturnType<any>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  variant?: T_SelectVariant;
  withManagePageScroll?: boolean;
} & BoxProps;

const SelectListingCategory = ({
  allowDeselect = false,
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  placeholder,
  required,
  variant,
  withManagePageScroll,
  ...restProps
}: T_SelectListingCategory) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingCategory = [...allListingCategory]
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
    <Select
      allowDeselect={allowDeselect}
      clearable={false}
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.listingCategory) : undefined}
      label={label}
      name={formNames.listingCategory}
      options={mapListingCategory}
      placeholder={placeholder}
      required={required}
      variant={variant}
      w="100%"
      withManagePageScroll={withManagePageScroll}
      {...(form
        ? {
            ...form.getInputProps(formNames.listingCategory),
          }
        : {})}
      {...restProps}
    />
  );
};

export default SelectListingCategory;

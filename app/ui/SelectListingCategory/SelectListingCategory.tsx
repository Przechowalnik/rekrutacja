/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoxProps } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingCategoryRent,
  allListingCategorySale,
  E_ListingCategory,
  E_ListingType,
  T_ListingType,
} from "~/models/enums";

import { Select, T_SelectVariant } from "../Select";
import { Tooltip } from "../Tooltip";

type T_SelectListingCategory = {
  allowDeselect?: boolean;
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  form?: UseFormReturnType<any>;
  label?: string;
  listingType: null | T_ListingType;
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
  listingType,
  placeholder,
  required,
  variant,
  withManagePageScroll,
  ...restProps
}: T_SelectListingCategory) => {
  const { t } = useTranslation(namespaces.common);

  const selectListingCategory =
    listingType === E_ListingType.RENT
      ? allListingCategoryRent
      : listingType === E_ListingType.SALE
        ? allListingCategorySale
        : [];

  const mapListingCategory = selectListingCategory
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
    <Tooltip
      disabled={!!listingType}
      fullWidth
      label={t("selectListingCategory.tooltipNoSelectedListingType")}
    >
      <Select
        allowDeselect={allowDeselect}
        clearable={false}
        defaultValue={defaultValue}
        description={description}
        disabled={disabled || !listingType}
        disabledWithOpacity={disabledWithOpacity}
        key={form ? form.key(formNames.listingCategory) : undefined}
        label={label}
        name={formNames.listingCategory}
        options={mapListingCategory}
        placeholder={placeholder}
        pointerEventsForTooltipOnDisabled={disabled || !listingType}
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
    </Tooltip>
  );
};

export default SelectListingCategory;

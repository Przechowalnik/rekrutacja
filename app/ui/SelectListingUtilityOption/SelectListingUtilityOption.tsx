import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingUtilityOptions,
  E_ListingUtilityOption,
  T_ListingUtilityOption,
} from "~/models/enums";

import { SelectMultipleBadge } from "../SelectMultipleBadge";

type T_SelectListingUtilityOption = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  options?: T_ListingUtilityOption[];
  required?: boolean;
};

const SelectListingUtilityOption = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  options = allListingUtilityOptions,
  required,
}: T_SelectListingUtilityOption) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingUtilityOption = [...options]
    .sort((a, b) =>
      t(`listingUtilityOption.${a}`).localeCompare(
        t(`listingUtilityOption.${b}`),
        "pl",
        {
          sensitivity: "base",
        },
      ),
    )
    .map(item => {
      return {
        label: `${t(`listingUtilityOption.${item}`)}`,
        value: E_ListingUtilityOption[item],
      };
    });

  return (
    <SelectMultipleBadge
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.listingUtilityOption) : undefined}
      label={label}
      name={formNames.listingUtilityOption}
      options={mapListingUtilityOption}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingUtilityOption),
          }
        : {})}
    />
  );
};

export default memo(SelectListingUtilityOption);

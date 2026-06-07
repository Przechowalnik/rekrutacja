import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingUsageOptions,
  E_ListingUsageOptions,
  T_ListingUsageOptions,
} from "~/models/enums";

import { SelectMultipleBadge } from "../SelectMultipleBadge";

type T_SelectListingUsageOption = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  options?: T_ListingUsageOptions[];
  required?: boolean;
};

const SelectListingUsageOption = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  options = allListingUsageOptions,
  required,
}: T_SelectListingUsageOption) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingUsageOptions = [...options]
    .sort((a, b) =>
      t(`listingUsageOptions.${a}`).localeCompare(
        t(`listingUsageOptions.${b}`),
        "pl",
        {
          sensitivity: "base",
        },
      ),
    )
    .map(item => {
      return {
        label: `${t(`listingUsageOptions.${item}`)}`,
        value: E_ListingUsageOptions[item],
      };
    });

  return (
    <SelectMultipleBadge
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.listingUsageOption) : undefined}
      label={label}
      name={formNames.listingUsageOption}
      options={mapListingUsageOptions}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingUsageOption),
          }
        : {})}
    />
  );
};

export default memo(SelectListingUsageOption);

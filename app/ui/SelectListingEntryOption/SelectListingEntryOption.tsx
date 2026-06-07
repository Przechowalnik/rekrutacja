import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingEntryOptions,
  E_ListingEntryOption,
  T_ListingEntryOption,
} from "~/models/enums";

import { SelectMultipleBadge } from "../SelectMultipleBadge";

type T_SelectListingEntryOption = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  options?: T_ListingEntryOption[];
  required?: boolean;
};

const SelectListingEntryOption = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  options = allListingEntryOptions,
  required,
}: T_SelectListingEntryOption) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingEntryOption = [...options]
    .sort((a, b) =>
      t(`listingEntryOption.${a}`).localeCompare(
        t(`listingEntryOption.${b}`),
        "pl",
        {
          sensitivity: "base",
        },
      ),
    )
    .map(item => {
      return {
        label: `${t(`listingEntryOption.${item}`)}`,
        value: E_ListingEntryOption[item],
      };
    });

  return (
    <SelectMultipleBadge
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.listingEntryOption) : undefined}
      label={label}
      name={formNames.listingEntryOption}
      options={mapListingEntryOption}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingEntryOption),
          }
        : {})}
    />
  );
};

export default memo(SelectListingEntryOption);

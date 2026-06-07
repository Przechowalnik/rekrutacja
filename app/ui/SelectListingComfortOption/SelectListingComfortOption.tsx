import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingComfortOptions,
  E_ListingComfortOption,
  T_ListingComfortOption,
} from "~/models/enums";

import { SelectMultipleBadge } from "../SelectMultipleBadge";

type T_SelectListingComfortOption = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  options?: T_ListingComfortOption[];
  required?: boolean;
};

const SelectListingComfortOption = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  options = allListingComfortOptions,
  required,
}: T_SelectListingComfortOption) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingComfortOption = [...options]
    .sort((a, b) =>
      t(`listingComfortOption.${a}`).localeCompare(
        t(`listingComfortOption.${b}`),
        "pl",
        {
          sensitivity: "base",
        },
      ),
    )
    .map(item => {
      return {
        label: `${t(`listingComfortOption.${item}`)}`,
        value: E_ListingComfortOption[item],
      };
    });

  return (
    <SelectMultipleBadge
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.listingComfortOption) : undefined}
      label={label}
      name={formNames.listingComfortOption}
      options={mapListingComfortOption}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingComfortOption),
          }
        : {})}
    />
  );
};

export default memo(SelectListingComfortOption);

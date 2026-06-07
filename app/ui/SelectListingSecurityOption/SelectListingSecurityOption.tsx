import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingSecurityOptions,
  E_ListingSecurityOption,
  T_ListingSecurityOption,
} from "~/models/enums";

import { SelectMultipleBadge } from "../SelectMultipleBadge";

type T_SelectListingSecurityOption = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  options?: T_ListingSecurityOption[];
  required?: boolean;
};

const SelectListingSecurityOption = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  options = allListingSecurityOptions,
  required,
}: T_SelectListingSecurityOption) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingSecurityOption = [...options]
    .sort((a, b) =>
      t(`listingSecurityOption.${a}`).localeCompare(
        t(`listingSecurityOption.${b}`),
        "pl",
        {
          sensitivity: "base",
        },
      ),
    )
    .map(item => {
      return {
        label: `${t(`listingSecurityOption.${item}`)}`,
        value: E_ListingSecurityOption[item],
      };
    });

  return (
    <SelectMultipleBadge
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.listingSecurityOption) : undefined}
      label={label}
      name={formNames.listingSecurityOption}
      options={mapListingSecurityOption}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingSecurityOption),
          }
        : {})}
    />
  );
};

export default memo(SelectListingSecurityOption);

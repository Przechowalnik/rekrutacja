/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComboboxItem } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingStatus,
  E_ListingStatus,
  T_ListingStatus,
} from "~/models/enums";

import { Select, T_SelectVariant } from "../Select";

type T_SelectListingStatus = {
  allowDeselect?: boolean;
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  form?: UseFormReturnType<any>;
  label?: string;
  onChange: (newValue: ComboboxItem | null | string) => void;
  required?: boolean;
  value?: null | T_ListingStatus;
  variant?: T_SelectVariant;
};

const SelectListingStatus = ({
  allowDeselect = false,
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  onChange,
  required,
  value,
  variant,
}: T_SelectListingStatus) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingStatus = [...allListingStatus]
    .sort((a, b) =>
      t(`listingStatus.${a}`).localeCompare(t(`listingStatus.${b}`), "pl", {
        sensitivity: "base",
      }),
    )
    .map(item => {
      return {
        label: `${t(`listingStatus.${item}`)}`,
        value: E_ListingStatus[item],
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
      key={form ? form.key(formNames.listingStatus) : undefined}
      label={label}
      name={formNames.listingStatus}
      options={mapListingStatus}
      required={required}
      variant={variant}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingStatus),
          }
        : { onChange, value })}
    />
  );
};

export default memo(SelectListingStatus);

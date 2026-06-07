/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allListingType, E_ListingType } from "~/models/enums";

import { Select } from "../Select";

type T_SelectListingType = {
  allowDeselect?: boolean;
  defaultValue?: string;
  description?: string;
  disabled?: boolean;

  disabledWithOpacity?: boolean;
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
  withManagePageScroll?: boolean;
};

const SelectListingType = ({
  allowDeselect = false,
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
  withManagePageScroll,
}: T_SelectListingType) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingType = [...allListingType]
    .sort((a, b) =>
      t(`listingType.${a}`).localeCompare(t(`listingType.${b}`), "pl", {
        sensitivity: "base",
      }),
    )
    .map(item => {
      return {
        label: `${t(`listingType.${item}`)}`,
        value: E_ListingType[item],
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
      key={form ? form.key(formNames.listingType) : undefined}
      label={label}
      name={formNames.listingType}
      options={mapListingType}
      required={required}
      w="100%"
      withManagePageScroll={withManagePageScroll}
      {...(form
        ? {
            ...form.getInputProps(formNames.listingType),
          }
        : {})}
    />
  );
};

export default memo(SelectListingType);

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingConditions,
  E_ListingCondition,
  T_ListingCondition,
} from "~/models/enums";

import { Select } from "../Select";

type T_SelectListingCondition = {
  allowDeselect?: boolean;
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  form?: UseFormReturnType<any>;
  label?: string;
  options?: T_ListingCondition[];
  required?: boolean;
  withManagePageScroll?: boolean;
};

const SelectListingCondition = ({
  allowDeselect,
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  options = allListingConditions,
  required,
  withManagePageScroll,
}: T_SelectListingCondition) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingCondition = [...options]
    .sort((a, b) =>
      t(`listingCondition.${a}`).localeCompare(
        t(`listingCondition.${b}`),
        "pl",
        {
          sensitivity: "base",
        },
      ),
    )
    .map(item => {
      return {
        label: `${t(`listingCondition.${item}`)}`,
        value: E_ListingCondition[item],
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
      key={form ? form.key(formNames.listingCondition) : undefined}
      label={label}
      name={formNames.listingCondition}
      options={mapListingCondition}
      required={required}
      w="100%"
      withManagePageScroll={withManagePageScroll}
      {...(form
        ? {
            ...form.getInputProps(formNames.listingCondition),
          }
        : {})}
    />
  );
};

export default memo(SelectListingCondition);

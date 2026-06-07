/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allListingDeleteReason, E_ListingDeleteReason } from "~/models/enums";

import { Select } from "../Select";

type T_SelectListingDeleteReason = {
  allowDeselect?: boolean;
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  form?: UseFormReturnType<any>;
  label?: string;
  onChange?: (value: null | string) => void;
  required?: boolean;
  value?: null | string;
};

const SelectListingDeleteReasonToMemoize = ({
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
}: T_SelectListingDeleteReason) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingDeleteReason = allListingDeleteReason.map(item => ({
    label: t(`listingDeleteReason.${item}`),
    value: E_ListingDeleteReason[item],
  }));

  return (
    <Select
      allowDeselect={allowDeselect}
      clearable={false}
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.listingDeleteReason) : undefined}
      label={label}
      name={formNames.listingDeleteReason}
      options={mapListingDeleteReason}
      required={required}
      w="100%"
      withManagePageScroll={false}
      withSort={false}
      {...(form
        ? { ...form.getInputProps(formNames.listingDeleteReason) }
        : {
            onChange,
            value,
          })}
    />
  );
};

export default memo(SelectListingDeleteReasonToMemoize);

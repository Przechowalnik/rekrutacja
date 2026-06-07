import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingAccess,
  E_ListingAccess,
  T_ListingAccess,
} from "~/models/enums";

import { Select } from "../Select";

type T_SelectListingAccess = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  options?: T_ListingAccess[];
  required?: boolean;
};

const SelectListingAccess = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  options = allListingAccess,
  required,
}: T_SelectListingAccess) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingAccess = [...options]
    .sort((a, b) =>
      t(`listingAccess.${a}`).localeCompare(t(`listingAccess.${b}`), "pl", {
        sensitivity: "base",
      }),
    )
    .map(item => {
      return {
        label: `${t(`listingAccess.${item}`)}`,
        value: E_ListingAccess[item],
      };
    });

  return (
    <Select
      allowDeselect={false}
      clearable={false}
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.listingAccess) : undefined}
      label={label}
      name={formNames.listingAccess}
      options={mapListingAccess}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingAccess),
          }
        : {})}
    />
  );
};

export default memo(SelectListingAccess);

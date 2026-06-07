import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allListingUnitTypes, E_ListingUnitType } from "~/models/enums";

import { Select } from "../Select";

type T_SelectListingUnitType = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

const SelectListingUnitType = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
}: T_SelectListingUnitType) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingUnitType = [...allListingUnitTypes]
    .sort((a, b) =>
      t(`listingUnitType.${a}`).localeCompare(t(`listingUnitType.${b}`), "pl", {
        sensitivity: "base",
      }),
    )
    .map(item => {
      return {
        label: `${t(`listingUnitType.${item}`)}`,
        value: E_ListingUnitType[item],
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
      key={form ? form.key(formNames.listingUnitType) : undefined}
      label={label}
      name={formNames.listingUnitType}
      options={mapListingUnitType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingUnitType),
          }
        : {})}
    />
  );
};

export default memo(SelectListingUnitType);

import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allListingParkingType, E_ListingParkingType } from "~/models/enums";

import { Select } from "../Select";

type T_SelectListingParkingType = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

const SelectListingParkingType = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
}: T_SelectListingParkingType) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingGaragesType = [...allListingParkingType]
    .sort((a, b) =>
      t(`listingParkingType.${a}`).localeCompare(
        t(`listingParkingType.${b}`),
        "pl",
        {
          sensitivity: "base",
        },
      ),
    )
    .map(item => {
      return {
        label: `${t(`listingParkingType.${item}`)}`,
        value: E_ListingParkingType[item],
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
      key={form ? form.key(formNames.listingParkingType) : undefined}
      label={label}
      name={formNames.listingParkingType}
      options={mapListingGaragesType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingParkingType),
          }
        : {})}
    />
  );
};

export default memo(SelectListingParkingType);

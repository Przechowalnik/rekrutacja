import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingContainerType,
  E_ListingContainerType,
} from "~/models/enums";

import { Select } from "../Select";

type T_SelectListingContainerType = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

const SelectListingContainerType = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
}: T_SelectListingContainerType) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingGaragesType = [...allListingContainerType]
    .sort((a, b) =>
      t(`listingContainerType.${a}`).localeCompare(
        t(`listingContainerType.${b}`),
        "pl",
        {
          sensitivity: "base",
        },
      ),
    )
    .map(item => {
      return {
        label: `${t(`listingContainerType.${item}`)}`,
        value: E_ListingContainerType[item],
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
      key={form ? form.key(formNames.listingContainerType) : undefined}
      label={label}
      name={formNames.listingContainerType}
      options={mapListingGaragesType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingContainerType),
          }
        : {})}
    />
  );
};

export default memo(SelectListingContainerType);

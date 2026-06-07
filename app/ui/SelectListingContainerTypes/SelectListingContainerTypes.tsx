import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allListingContainerType,
  E_ListingContainerType,
  T_ListingContainerType,
} from "~/models/enums";

import { SelectMultipleBadge } from "../SelectMultipleBadge";

type T_SelectListingContainerTypes = {
  defaultValues?: T_ListingContainerType[];
  description?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

const SelectListingContainerTypes = ({
  defaultValues,
  description,
  disabled,
  form,
  label,
  required,
}: T_SelectListingContainerTypes) => {
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
    <SelectMultipleBadge
      defaultValue={defaultValues}
      description={description}
      disabled={disabled}
      key={form ? form.key(formNames.listingContainerTypes) : undefined}
      label={label}
      name={formNames.listingContainerTypes}
      options={mapListingGaragesType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingContainerTypes),
          }
        : {})}
    />
  );
};

export default memo(SelectListingContainerTypes);

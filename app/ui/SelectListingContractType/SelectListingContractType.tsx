import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allListingContractType, E_ListingContractType } from "~/models/enums";

import { Select } from "../Select";

type T_SelectListingContractType = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
  withManagePageScroll?: boolean;
};

const SelectListingContractType = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
  withManagePageScroll,
}: T_SelectListingContractType) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingContractType = [...allListingContractType]
    .sort((a, b) =>
      t(`listingContractType.${a}`).localeCompare(
        t(`listingContractType.${b}`),
        "pl",
        {
          sensitivity: "base",
        },
      ),
    )
    .map(item => {
      return {
        label: `${t(`listingContractType.${item}`)}`,
        value: E_ListingContractType[item],
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
      key={form ? form.key(formNames.listingContractType) : undefined}
      label={label}
      name={formNames.listingContractType}
      options={mapListingContractType}
      required={required}
      w="100%"
      withManagePageScroll={withManagePageScroll}
      {...(form
        ? {
            ...form.getInputProps(formNames.listingContractType),
          }
        : {})}
    />
  );
};

export default memo(SelectListingContractType);

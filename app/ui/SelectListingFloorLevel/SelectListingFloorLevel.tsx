/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";

import { Select } from "../Select";

export type T_SelectListingFloorLevels = {
  from: number;
  to: number;
};

type T_SelectListingFloorLevel = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  levels?: T_SelectListingFloorLevels;
  required?: boolean;
};

const SelectListingFloorLevel = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  levels = {
    from: -2,
    to: 12,
  },
  required,
}: T_SelectListingFloorLevel) => {
  const { t } = useTranslation(namespaces.common);

  const mapListingFloorLevel = Array.from(
    { length: levels.to - levels.from + 1 },
    (_, index) => levels.from + index,
  ).map(floor => {
    return {
      //@ts-ignore
      label: `${t(`listingFloorLevel.${floor}`)}`,
      value: floor.toString(),
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
      key={form ? form.key(formNames.listingFloorLevel) : undefined}
      label={label}
      name={formNames.listingFloorLevel}
      options={mapListingFloorLevel}
      required={required}
      w="100%"
      withSort={false}
      {...(form
        ? {
            ...form.getInputProps(formNames.listingFloorLevel),
          }
        : {})}
    />
  );
};

export default memo(SelectListingFloorLevel);

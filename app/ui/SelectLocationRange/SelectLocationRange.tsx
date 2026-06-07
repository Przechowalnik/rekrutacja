/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComboboxItem, MantineSize } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";

import { formNames, T_FormNames } from "~/lib/zodFormValidator";
import { allLocationRadius, T_LocationRadius } from "~/models/enums";

import { Select } from "../Select";

type T_SelectLocationRange = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  districtName?: T_FormNames;
  error?: string;
  form?: UseFormReturnType<any>;
  label?: string;
  onChange?: (newValue: null | T_LocationRadius) => void;
  pointerEventsForTooltipOnDisabled?: boolean;
  required?: boolean;
  size?: MantineSize | (string & {}); //NOSONAR
  value?: null | T_LocationRadius;
  withManagePageScroll?: boolean;
};

const SelectLocationRange = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  error,
  form,
  label,
  onChange,
  pointerEventsForTooltipOnDisabled,
  required,
  size,
  value,
  withManagePageScroll,
}: T_SelectLocationRange) => {
  const handleOnChange = (newValue: ComboboxItem | null | number) => {
    if (form) {
      form.setFieldValue(formNames.locationRadius, "");
    }
    onChange?.(newValue as null | T_LocationRadius);
  };

  const locationRadius = allLocationRadius.map(item => {
    return {
      label: `+${item} km`,
      value: item.toString(),
    };
  });

  return (
    <Select
      allowDeselect
      clearable
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      error={error}
      key={form ? form.key(formNames.locationRadius) : undefined}
      label={label}
      name={formNames.locationRadius}
      options={locationRadius}
      pointerEventsForTooltipOnDisabled={pointerEventsForTooltipOnDisabled}
      required={required}
      size={size}
      w="100%"
      withManagePageScroll={withManagePageScroll}
      withSort={false}
      {...(form
        ? {
            ...form.getInputProps(formNames.locationRadius),
          }
        : {
            onChange: handleOnChange,
            value: value ? value.toString() : "",
          })}
    />
  );
};

export default memo(SelectLocationRange);

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComboboxItem, MantineSize } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { T_Cities } from "~/models/cities";
import { T_CityDistrictName, T_CityDistricts } from "~/models/cityNested";

import { Select } from "../Select";
import { Tooltip } from "../Tooltip";

type T_SelectCityDistrict = {
  city: null | T_Cities[number];
  clearable?: boolean;
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  error?: string;
  forceDisabledTooltip?: boolean;
  form?: UseFormReturnType<any>;
  label?: string;
  onChange?: (newDistrict: null | T_CityDistricts[number]) => void;
  placeholder?: string;
  required?: boolean;
  size?: MantineSize | (string & {}); // NOSONAR
  tooltip?: string;
  value?: null | T_CityDistrictName;
  withManagePageScroll?: boolean;
};

const SelectCityDistrict = ({
  city,
  clearable,
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  error,
  forceDisabledTooltip,
  form,
  label,
  onChange,
  placeholder,
  required,
  size,
  tooltip,
  value,
  withManagePageScroll,
}: T_SelectCityDistrict) => {
  const { t } = useTranslation(namespaces.common);

  const handleOnChange = (newValue: ComboboxItem | null | string) => {
    const foundDistrict = city?.districts.find(item => item.name === newValue);

    onChange?.(foundDistrict ?? null);
  };

  const mapListingDistricts = useMemo(
    () =>
      (city?.districts ?? [])
        .sort((a, b) =>
          a.name.localeCompare(b.name, "pl", {
            sensitivity: "base",
          }),
        )
        .map(item => {
          return {
            label: item.name,
            value: item.name,
          };
        }),
    [city],
  );

  return (
    <Tooltip
      disabled={(!!city && !disabled) || forceDisabledTooltip}
      fullWidth
      label={tooltip ?? t("selectListingCityDistrict.tooltipNoSelectedCity")}
      withCursorNotAllowed={false}
    >
      <Select
        allowDeselect
        clearable={clearable}
        defaultValue={defaultValue}
        description={description}
        disabled={disabled || !city}
        disabledWithOpacity={disabledWithOpacity}
        error={error}
        key={form ? form.key(formNames.listingDistrict) : undefined}
        label={label}
        name={formNames.listingDistrict}
        options={mapListingDistricts}
        placeholder={placeholder}
        pointerEventsForTooltipOnDisabled={disabled || !city}
        required={required}
        size={size}
        w="100%"
        withManagePageScroll={withManagePageScroll}
        {...(form
          ? {
              ...form.getInputProps(formNames.listingDistrict),
            }
          : {
              onChange: handleOnChange,
              value,
            })}
      />
    </Tooltip>
  );
};

export default memo(SelectCityDistrict);

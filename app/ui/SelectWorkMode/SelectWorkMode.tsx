/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allWorkMode, E_WorkMode } from "~/models/enums";

import { Select } from "../Select";

type T_SelectWorkMode = {
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

const SelectWorkModeToMemoize = ({
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
}: T_SelectWorkMode) => {
  const { t } = useTranslation(namespaces.common);

  const mapWorkMode = allWorkMode.map(item => ({
    label: t(`workMode.${item}`),
    value: E_WorkMode[item],
  }));

  return (
    <Select
      allowDeselect={allowDeselect}
      clearable={false}
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.listingWorkMode) : undefined}
      label={label}
      name={formNames.listingWorkMode}
      options={mapWorkMode}
      required={required}
      w="100%"
      withManagePageScroll={false}
      withSort={false}
      {...(form
        ? { ...form.getInputProps(formNames.listingWorkMode) }
        : {
            onChange,
            value,
          })}
    />
  );
};

export default memo(SelectWorkModeToMemoize);

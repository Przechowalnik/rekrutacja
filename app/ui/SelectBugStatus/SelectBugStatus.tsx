import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allBugStatus, E_BugStatus } from "~/models/enums";

import { Select } from "../Select";

type T_SelectBugStatus = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

export const SelectBugStatus = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
}: T_SelectBugStatus) => {
  const { t } = useTranslation(namespaces.common);

  const mapPlansType = allBugStatus.map(item => {
    return {
      label: `${t(`bugStatus.${item}`)}`,
      value: E_BugStatus[item],
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
      key={form ? form.key(formNames.bugStatus) : undefined}
      label={label}
      name={formNames.bugStatus}
      options={mapPlansType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.bugStatus),
          }
        : {})}
    />
  );
};

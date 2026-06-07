import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allBugPriority, E_BugPriority } from "~/models/enums";

import { Select } from "../Select";

type T_SelectBugPriority = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

export const SelectBugPriority = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
}: T_SelectBugPriority) => {
  const { t } = useTranslation(namespaces.common);

  const mapPlansType = allBugPriority.map(item => {
    return {
      label: `${t(`bugPriorityType.${item}`)}`,
      value: E_BugPriority[item],
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
      key={form ? form.key(formNames.bugPriority) : undefined}
      label={label}
      name={formNames.bugPriority}
      options={mapPlansType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.bugPriority),
          }
        : {})}
    />
  );
};

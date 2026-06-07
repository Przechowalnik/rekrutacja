import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allBugEnvironment, E_BugEnvironment } from "~/models/enums";

import { Select } from "../Select";

type T_SelectBugEnvironment = {
  allowDeselect?: boolean;
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

export const SelectBugEnvironment = ({
  allowDeselect,
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
}: T_SelectBugEnvironment) => {
  const { t } = useTranslation(namespaces.common);

  const mapPlansType = allBugEnvironment.map(item => {
    return {
      label: `${t(`bugEnvironmentType.${item}`)}`,
      value: E_BugEnvironment[item],
    };
  });

  return (
    <Select
      allowDeselect={allowDeselect}
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.bugEnvironment) : undefined}
      label={label}
      name={formNames.bugEnvironment}
      options={mapPlansType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.bugEnvironment),
          }
        : {})}
    />
  );
};

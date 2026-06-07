import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allCompanyWorkerRoles, E_Roles } from "~/models/enums";

import { Select } from "../Select";

type T_SelectCompanyWorkerRoles = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

export const SelectCompanyWorkerRoles = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
}: T_SelectCompanyWorkerRoles) => {
  const { t } = useTranslation(namespaces.common);

  const mapPlansType = allCompanyWorkerRoles.map(item => {
    return {
      label: `${t(`userRole.${item}`)}`,
      value: E_Roles[item],
    };
  });

  return (
    <Select
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.companyWorkerRole) : undefined}
      label={label}
      name={formNames.companyWorkerRole}
      options={mapPlansType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.companyWorkerRole),
          }
        : {})}
    />
  );
};

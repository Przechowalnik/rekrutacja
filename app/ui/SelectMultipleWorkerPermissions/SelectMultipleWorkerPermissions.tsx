import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import {
  allCompanyWorkerPermissions,
  E_CompanyWorkerPermissions,
} from "~/models/enums";

import { SelectMultipleBadge } from "../SelectMultipleBadge";

type T_SelectMultipleWorkerPermissions = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

export const SelectMultipleWorkerPermissions = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
}: T_SelectMultipleWorkerPermissions) => {
  const { t } = useTranslation(namespaces.common);

  const mapCompanyWorkerPermissions = allCompanyWorkerPermissions.map(item => {
    return {
      label: `${t(`companyWorkerPermission.${item}`)}`,
      value: E_CompanyWorkerPermissions[item],
    };
  });

  return (
    <SelectMultipleBadge
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.companyWorkerPermission) : undefined}
      label={label}
      name={formNames.companyWorkerPermission}
      options={mapCompanyWorkerPermissions}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.companyWorkerPermission),
          }
        : {})}
    />
  );
};

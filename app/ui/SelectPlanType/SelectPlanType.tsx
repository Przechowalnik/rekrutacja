import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allPlanTypes, E_PlanType } from "~/models/enums";

import { Select } from "../Select";

type T_SelectPlanType = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

export const SelectPlanType = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
}: T_SelectPlanType) => {
  const { t } = useTranslation(namespaces.common);

  const mapPlansType = allPlanTypes.map(item => {
    return {
      label: `${t(`plansType.${item}`)}`,
      value: E_PlanType[item],
    };
  });

  return (
    <Select
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.planType) : undefined}
      label={label}
      name={formNames.planType}
      options={mapPlansType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.planType),
          }
        : {})}
    />
  );
};

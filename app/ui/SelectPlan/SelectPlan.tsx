import type { UseFormReturnType } from "@mantine/form";

import { formNames } from "~/lib/zodFormValidator";
import type { T_Plans } from "~/models/plans";

import { Select } from "../Select";

type T_SelectPlan = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  plans: T_Plans;
  required?: boolean;
};

export const SelectPlan = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  plans,
  required,
}: T_SelectPlan) => {
  const mapPlans = plans?.map(item => {
    return {
      label: item.name,
      value: item.id,
    };
  });

  return (
    <Select
      allowDeselect={false}
      defaultValue={defaultValue}
      description={description}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.planId) : undefined}
      label={label}
      name={formNames.planId}
      options={mapPlans}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.planId),
          }
        : {})}
    />
  );
};

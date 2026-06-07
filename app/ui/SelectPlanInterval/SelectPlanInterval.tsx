import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allPlanIntervals, E_PlanInterval } from "~/models/enums";

import { Select } from "../Select";

type T_SelectPlanInterval = {
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  required?: boolean;
};

export const SelectPlanInterval = ({
  disabled,
  disabledWithOpacity,
  form,
  required,
}: T_SelectPlanInterval) => {
  const { t } = useTranslation(namespaces.common);

  const mapPlansType = allPlanIntervals.map(item => {
    return {
      label: `${t(`plansInterval.${item}`)}`,
      value: E_PlanInterval[item],
    };
  });

  return (
    <Select
      defaultValue={E_PlanInterval.MONTH}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.planInterval) : undefined}
      name={formNames.planInterval}
      options={mapPlansType}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.planInterval),
          }
        : {})}
    />
  );
};

import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allReportType, E_ReportType } from "~/models/enums";

import { Select } from "../Select";

type T_SelectReport = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
  withManagePageScroll?: boolean;
};

export const SelectReport = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
  withManagePageScroll,
}: T_SelectReport) => {
  const { t } = useTranslation(namespaces.common);

  const mapPlansType = allReportType.map(item => {
    return {
      label: `${t(`reportType.${item}`)}`,
      value: E_ReportType[item],
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
      key={form ? form.key(formNames.reportType) : undefined}
      label={label}
      name={formNames.reportType}
      options={mapPlansType}
      required={required}
      w="100%"
      withManagePageScroll={withManagePageScroll}
      withSort={false}
      {...(form
        ? {
            ...form.getInputProps(formNames.reportType),
          }
        : {})}
    />
  );
};

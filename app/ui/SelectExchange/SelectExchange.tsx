import type { UseFormReturnType } from "@mantine/form";

import { formNames } from "~/lib/zodFormValidator";
import type { T_Exchanges } from "~/models/exchanges";

import { Select } from "../Select";

type T_SelectExchange = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  exchanges: T_Exchanges;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

export const SelectExchange = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  exchanges,
  form,
  label,
  required,
}: T_SelectExchange) => {
  const mapExchanges = exchanges?.map(item => {
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
      key={form ? form.key(formNames.exchangeId) : undefined}
      label={label}
      name={formNames.exchangeId}
      options={mapExchanges}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.exchangeId),
          }
        : {})}
    />
  );
};

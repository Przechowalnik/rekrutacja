import { Flex } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";

import { formNames } from "~/lib/zodFormValidator";
import { allCountries, E_TaxCountry } from "~/models/enums";
import type { T_Input } from "~/ui/Input";
import { Input } from "~/ui/Input";

import { Select } from "../Select";

type T_InputTax = {
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
} & Partial<T_Input>;

const InputTax = ({
  description,
  form,
  label,
  required,
  ...restProps
}: T_InputTax) => {
  const mapTaxCountries = allCountries.map(item => {
    return {
      label: E_TaxCountry[item],
      value: E_TaxCountry[item],
    };
  });

  return (
    <Flex
      align="center"
      gap={24}
      styles={{
        root: {
          position: "relative",
        },
      }}
      w="100%"
      wrap="wrap"
    >
      <Select
        {...restProps}
        defaultValue={E_TaxCountry.POLAND}
        description={description}
        disabled
        disabledWithOpacity={false}
        key={form ? form.key(formNames.taxCountry) : undefined}
        name={formNames.taxCountry}
        options={mapTaxCountries}
        required={required}
        w={{ base: "100%", xs: "200px" }}
        {...(form
          ? {
              ...form.getInputProps(formNames.taxCountry),
            }
          : {})}
      />
      <Input
        {...restProps}
        description={description}
        key={form ? form.key(formNames.taxNumber) : undefined}
        label={label}
        name={formNames.taxNumber}
        required={required}
        type="number"
        w={{ base: "100%", xs: "calc(100% - 200px - 24px)" }}
        withNumberSeparator={false}
        {...(form
          ? {
              ...form.getInputProps(formNames.taxNumber),
            }
          : {})}
      />
    </Flex>
  );
};

export default memo(InputTax);

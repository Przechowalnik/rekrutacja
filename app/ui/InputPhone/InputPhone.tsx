import { Flex } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { inputMaxLength } from "~/constants/input";
import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allCountries, E_CountryCode } from "~/models/enums";
import type { T_Input } from "~/ui/Input";
import { Input } from "~/ui/Input";

import { Select } from "../Select";

type T_InputPhone = {
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  isCompanyPhone?: boolean;
  label?: string;
  required?: boolean;
} & Partial<T_Input>;

const InputPhone = ({
  description,
  disabled,
  form,
  isCompanyPhone = false,
  label,
  required,
  ...restProps
}: T_InputPhone) => {
  const { t } = useTranslation(namespaces.common);

  const mapCountryCodes = allCountries.map(item => {
    return {
      label: `${t(`countriesCode.${item}`)} +${E_CountryCode[item]}`,
      value: E_CountryCode[item],
    };
  });

  const validCountryCode = isCompanyPhone
    ? formNames.companyPhoneCountryCode
    : formNames.phoneCountryCode;

  const validNumber = isCompanyPhone
    ? formNames.companyPhoneNumber
    : formNames.phoneNumber;

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
        defaultValue={E_CountryCode.POLAND}
        description={description}
        disabled
        disabledWithOpacity={false}
        key={form ? form.key(validCountryCode) : undefined}
        name={validCountryCode}
        options={mapCountryCodes}
        required={required}
        w={{ base: "100%", xs: "200px" }}
        {...(form
          ? {
              ...form.getInputProps(validCountryCode),
            }
          : {})}
      />
      <Input
        {...restProps}
        description={description}
        disabled={disabled}
        key={form ? form.key(validNumber) : undefined}
        label={label}
        max={inputMaxLength.phoneNumber}
        name={validNumber}
        required={required}
        type="tel"
        w={{ base: "100%", xs: "calc(100% - 200px - 24px)" }}
        {...(form
          ? {
              ...form.getInputProps(validNumber),
            }
          : {})}
      />
    </Flex>
  );
};

export default memo(InputPhone);

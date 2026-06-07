import type { MantineSize } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";
import { allCountries, E_Country } from "~/models/enums";

import { Select } from "../Select";

type T_InputCountry = {
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  required?: boolean;
  size?: MantineSize | (string & {}); // NOSONAR
};

const InputCountry = ({
  disabled,
  disabledWithOpacity,
  form,
  required,
  size,
}: T_InputCountry) => {
  const { t } = useTranslation(namespaces.common);

  const mapTaxCountries = allCountries.map(item => {
    return {
      label: `${t(`countriesCode.${item}`)}`,
      value: E_Country[item],
    };
  });

  return (
    <Select
      allowDeselect={false}
      defaultValue={E_Country.POLAND}
      disabled={disabled}
      disabledWithOpacity={disabledWithOpacity}
      key={form ? form.key(formNames.country) : undefined}
      name={formNames.country}
      options={mapTaxCountries}
      required={required}
      size={size}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.country),
          }
        : {})}
    />
  );
};

export default memo(InputCountry);

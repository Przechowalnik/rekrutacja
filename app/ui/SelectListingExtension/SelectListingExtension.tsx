import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { formNames } from "~/lib/zodFormValidator";

import { Select } from "../Select";

type T_SelectListingExtension = {
  defaultValue?: string;
  description?: string;
  disabled?: boolean;
  disabledWithOpacity?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
};

export const SelectListingExtension = ({
  defaultValue,
  description,
  disabled,
  disabledWithOpacity,
  form,
  label,
  required,
}: T_SelectListingExtension) => {
  const { t } = useTranslation(namespaces.common);

  const mapExtensions = Array.from({ length: 5 })
    .fill(null)

    .map((_, index) => {
      const newValue = (index * 3 || 1) as 1 | 12 | 3 | 6 | 9;

      return {
        label: t(`listingExtension.${newValue}`),
        value: newValue.toString(),
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
      key={form ? form.key(formNames.listingExtension) : undefined}
      label={label}
      name={formNames.listingExtension}
      options={mapExtensions}
      required={required}
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.listingExtension),
          }
        : {})}
    />
  );
};

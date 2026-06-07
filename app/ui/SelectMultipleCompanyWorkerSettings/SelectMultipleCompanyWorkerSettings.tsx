import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import type { UseFormReturnType } from "@mantine/form";

import { formNames } from "~/lib/zodFormValidator";
import type { T_CompanyWorkerSettings } from "~/models/company/companyWorkerSettings";

import { Avatar } from "../Avatar";
import { SelectMultiple } from "../SelectMultiple";

type T_SelectMultipleCompanyWorkerSettings = {
  companyWorkersSettings: T_CompanyWorkerSettings[];
  description?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
  withoutDescription?: boolean;
};

export const SelectMultipleCompanyWorkerSettings = ({
  companyWorkersSettings,
  description,
  disabled,
  form,
  label,
  required,
  withoutDescription,
}: T_SelectMultipleCompanyWorkerSettings) => {
  const mapWorkersSettings = companyWorkersSettings.map(item => {
    return {
      icon: (
        <Avatar
          color="gray"
          customIcon={item?.user?.avatar ? faUserGroup : undefined}
          pointer
          radius="xl"
          size="sm"
          url={item?.user?.avatar ?? undefined}
          variant="light"
          withBorderPrimary={false}
        />
      ),
      label: `${item?.user?.firstName} ${item?.user?.lastName}`,
      value: item.id,
    };
  });

  return (
    <SelectMultiple
      description={withoutDescription ? "" : description}
      disabled={disabled}
      key={form ? form.key(formNames.companyWorkersSettingsIds) : undefined}
      label={label}
      name={formNames.companyWorkersSettingsIds}
      options={mapWorkersSettings}
      required={required}
      searchable
      size="sm"
      w="100%"
      {...(form
        ? {
            ...form.getInputProps(formNames.companyWorkersSettingsIds),
          }
        : {})}
    />
  );
};

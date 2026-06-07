import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import type { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { useUserCookie } from "~/hooks/useUserCookie";
import { formNames } from "~/lib/zodFormValidator";
import type { T_CompanyWorkers } from "~/models/company/companyWorkers";

import { Avatar } from "../Avatar";
import { SelectMultiple } from "../SelectMultiple";

type T_SelectMultipleCompanyWorkers = {
  companyWorkers: T_CompanyWorkers;
  description?: string;
  disabled?: boolean;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturnType<any>;
  label?: string;
  required?: boolean;
  valueIsSettingsId?: boolean;
  withoutDescription?: boolean;
};

export const SelectMultipleCompanyWorkers = ({
  companyWorkers = [],
  description,
  disabled,
  error,
  form,
  label,
  required,
  valueIsSettingsId,
  withoutDescription,
}: T_SelectMultipleCompanyWorkers) => {
  const { t } = useTranslation(namespaces.common);
  const { userCookie } = useUserCookie();

  const mapWorkers = companyWorkers
    .filter(item => !!item.workerSettings?.id)
    .map(item => {
      return {
        icon: (
          <Avatar
            color="gray"
            customIcon={item?.avatar ? faLayerGroup : undefined}
            pointer
            radius="xl"
            size="sm"
            url={item?.avatar ?? undefined}
            variant="light"
            withBorderPrimary={false}
          />
        ),
        label: `${item?.firstName} ${item?.lastName}${item?.id === userCookie?.userId ? ` ${t("selectMultipleCompanyWorkers.you")}` : ""}`,
        value: valueIsSettingsId ? (item?.workerSettings?.id ?? "") : item.id,
      };
    });

  return (
    <SelectMultiple
      key={form ? form.key(formNames.companyWorkersIds) : undefined}
      {...(form
        ? {
            ...form.getInputProps(formNames.companyWorkersIds),
          }
        : {})}
      description={withoutDescription ? "" : description}
      disabled={disabled}
      error={error}
      label={label}
      name={formNames.companyWorkersIds}
      options={mapWorkers}
      required={required}
      searchable
      w="100%"
    />
  );
};

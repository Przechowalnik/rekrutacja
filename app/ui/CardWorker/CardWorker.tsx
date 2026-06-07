import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useUser } from "~/hooks/useUser";
import type { T_CompanyWorkers } from "~/models/company/companyWorkers";
import { E_CompanyWorkerPermissions, E_Roles } from "~/models/enums";

import type { T_CardBadge } from "../Card";
import { Card } from "../Card";
import { Text } from "../Text";

type T_CardWorker = {
  companyWorker: T_CompanyWorkers[number];
};

const CardWorkerToMemoize = ({ companyWorker }: T_CardWorker) => {
  const { t } = useTranslation(namespaces.common);
  const { getLocalizedRoute } = useLocalizedRoute();
  const { user } = useUser();

  const hasPermissionToShowAllPermissions =
    user?.role?.includes(E_Roles.B2B_OWNER) ||
    user?.workerSettings?.permissions?.includes(
      E_CompanyWorkerPermissions.MANAGE_WORKERS,
    );

  const hasPermissionsToShowWorker =
    user?.role?.includes(E_Roles.B2B_OWNER) ||
    user?.workerSettings?.permissions?.includes(
      E_CompanyWorkerPermissions.MANAGE_WORKERS,
    ) ||
    user?.id === companyWorker.id;

  const mapPermissions = companyWorker?.workerSettings?.permissions
    ?.map(item => t(`companyWorkerPermission.${item}`))
    .join(", ");

  const badges: T_CardBadge[] = [];
  if (companyWorker?.emailVerification?.verifiedAt) {
    badges.push({
      color: "green",
      label: t(`cardWorker.verified`),
    });
  } else {
    badges.push({
      color: "red",
      label: t(`cardWorker.noVerified`),
    });
  }

  return (
    <Card
      badges={badges}
      color={hasPermissionsToShowWorker ? undefined : "gray"}
      href={getLocalizedRoute({
        extraPath: `/${companyWorker.id}`,
        route: E_Routes.companyWorkerEdit,
      })}
      isEditable={!!hasPermissionsToShowWorker}
      minHeight={{
        base: "auto",
        xs: hasPermissionsToShowWorker ? 300 : 240,
      }}
      title={`${companyWorker.firstName.toUpperCase()}${companyWorker?.lastName ? ` ${companyWorker.lastName.toUpperCase()}` : ""} ${user?.id === companyWorker.id ? t(`cardWorker.you`) : ""}`}
    >
      <Text c="white" size="sm">
        {t("cardWorker.role")}: <b>{t(`userRole.${companyWorker.role}`)}</b>
      </Text>
      <Text c="white" size="sm">
        {t("cardWorker.email")}: <b>{companyWorker?.email}</b>
      </Text>
      {hasPermissionToShowAllPermissions &&
        companyWorker?.role !== E_Roles.B2B_OWNER && (
          <Text c="white" size="sm">
            {t("cardWorker.permissions")}:{" "}
            <b>{mapPermissions || t("cardWorker.noPermissions")}</b>
          </Text>
        )}
    </Card>
  );
};

export const CardWorker = memo(CardWorkerToMemoize);

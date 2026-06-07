import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { getSettingsAdmin } from "~/data/adminSettings.server";
import { requireAdminSession } from "~/data/auth.server";
import { E_RolesServer } from "~/data/models.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_PlatformSetting } from "~/models/platformSetting";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminPlatformSettingsPage = dynamic(() =>
  import("~/components/AdminPlatformSettingsPage").then(module => ({
    default: module.AdminPlatformSettingsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminSettings],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          platformSetting: Z_PlatformSetting.nullable(),
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN_SUPER]}>
            <AdminPlatformSettingsPage platformSetting={data.platformSetting} />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
      userRoles: [E_RolesServer.ADMIN_SUPER],
    });

    return await getSettingsAdmin({
      request,
      requiredSettings: false,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

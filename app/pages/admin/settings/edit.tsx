import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import {
  getSettingsAdmin,
  updatePlatformSettingsAdmin,
} from "~/data/adminSettings.server";
import { requireAdminSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Plans } from "~/models/plans";
import { Z_PlatformSetting } from "~/models/platformSetting";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminPlatformSettingEditPage = dynamic(() =>
  import("~/components/AdminPlatformSettingEditPage").then(module => ({
    default: module.AdminPlatformSettingEditPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminSettingEdit],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          plans: Z_Plans,
          platformSetting: Z_PlatformSetting,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN_SUPER]}>
            <AdminPlatformSettingEditPage
              plans={data.plans}
              platformSetting={data.platformSetting}
            />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
      userRoles: [E_RolesServer.ADMIN_SUPER],
    });

    switch (request.method) {
      case E_Requests.patch: {
        return await updatePlatformSettingsAdmin({
          request,
          userId,
          userSessionVersion,
        });
      }
    }

    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
    });
    return await getSettingsAdmin({
      request,
      requiredSettings: true,
      userId,
      userSessionVersion,
      withPlans: true,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import {
  checkSettingsNoExistAndGetPlans,
  createNewPlatformSettingsAdmin,
} from "~/data/adminSettings.server";
import { requireAdminSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Plans } from "~/models/plans";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminPlatformSettingNewPage = dynamic(() =>
  import("~/components/AdminPlatformSettingNewPage").then(module => ({
    default: module.AdminPlatformSettingNewPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminSettingNew],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          plans: Z_Plans,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN_SUPER]}>
            <AdminPlatformSettingNewPage plans={data.plans} />
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
      case E_Requests.post: {
        return await createNewPlatformSettingsAdmin({
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

    return await checkSettingsNoExistAndGetPlans({
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

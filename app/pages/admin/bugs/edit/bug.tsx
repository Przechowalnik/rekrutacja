import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { getBugAdmin, updateBugAdmin } from "~/data/adminBug.server";
import { requireAdminSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_Bug } from "~/models/bug";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminBugEditPage = dynamic(() =>
  import("~/components/AdminBugEditPage").then(module => ({
    default: module.AdminBugEditPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminBugEdit],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          bug: Z_Bug,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN, E_Roles.ADMIN_SUPER]}>
            <AdminBugEditPage bug={data.bug} />
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
    });

    switch (request.method) {
      case E_Requests.patch: {
        return await updateBugAdmin({ request, userId, userSessionVersion });
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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
    });

    return await getBugAdmin({
      bugId: params?.bugId,
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

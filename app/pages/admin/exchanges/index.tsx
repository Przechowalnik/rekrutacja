import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { getExchangesAdmin } from "~/data/adminExchange.server";
import { requireAdminSession } from "~/data/auth.server";
import { E_RolesServer } from "~/data/models.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Exchanges } from "~/models/exchanges";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminExchangePage = dynamic(() =>
  import("~/components/AdminExchangePage").then(module => ({
    default: module.AdminExchangePage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminExchanges],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          exchanges: Z_Exchanges,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN_SUPER]}>
            <AdminExchangePage exchanges={data.exchanges} />
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

    return await getExchangesAdmin({ request, userId, userSessionVersion });
  } catch (error) {
    return responseThrowError({ error });
  }
};

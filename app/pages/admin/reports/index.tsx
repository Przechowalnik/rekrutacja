import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { getReportsAdmin } from "~/data/adminReports.server";
import { requireAdminSession } from "~/data/auth.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Reports } from "~/models/reports";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminReportsPage = dynamic(() =>
  import("~/components/AdminReportsPage").then(module => ({
    default: module.AdminReportsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminReports],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          nextPage: z.number().nullable(),
          reports: Z_Reports,
          totalPages: z.number().optional().nullable(),
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN, E_Roles.ADMIN_SUPER]}>
            <AdminReportsPage
              nextPage={data.nextPage}
              reports={data.reports}
              totalPages={data.totalPages}
            />
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
    });

    return await getReportsAdmin({ request, userId, userSessionVersion });
  } catch (error) {
    return responseThrowError({ error });
  }
};

import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { getBugsAdmin } from "~/data/adminBug.server";
import { requireAdminSession } from "~/data/auth.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_Bugs } from "~/models/bugs";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminBugsPage = dynamic(() =>
  import("~/components/AdminBugsPage").then(module => ({
    default: module.AdminBugsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminBugs],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          bugs: Z_Bugs,
          nextPage: z.number().nullable(),
          totalPages: z.number().optional().nullable(),
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN, E_Roles.ADMIN_SUPER]}>
            <AdminBugsPage
              bugs={data.bugs}
              nextPage={data.nextPage}
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

    return await getBugsAdmin({ request, userId, userSessionVersion });
  } catch (error) {
    return responseThrowError({ error });
  }
};

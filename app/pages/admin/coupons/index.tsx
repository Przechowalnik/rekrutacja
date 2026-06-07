import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { AdminCouponsPage } from "~/components/AdminCouponsPage";
import { namespaces } from "~/constants/namespaces";
import { getCouponsAdmin } from "~/data/adminCoupons.server";
import { requireAdminSession } from "~/data/auth.server";
import { responseThrowError } from "~/data/response.server";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_Coupons } from "~/models/coupons";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminCoupons],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          coupons: Z_Coupons,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN, E_Roles.ADMIN_SUPER]}>
            <AdminCouponsPage coupons={data.coupons} />
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

    return await getCouponsAdmin({ request, userId, userSessionVersion });
  } catch (error) {
    return responseThrowError({ error });
  }
};

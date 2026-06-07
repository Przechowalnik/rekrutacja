import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { getProductsAdmin } from "~/data/adminProduct";
import { requireAdminSession } from "~/data/auth.server";
import { E_RolesServer } from "~/data/models.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Products } from "~/models/products";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminProductsPage = dynamic(() =>
  import("~/components/AdminProductsPage").then(module => ({
    default: module.AdminProductsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminProducts],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          products: Z_Products,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN_SUPER]}>
            <AdminProductsPage products={data.products} />
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

    return await getProductsAdmin({ request, userId, userSessionVersion });
  } catch (error) {
    return responseThrowError({ error });
  }
};

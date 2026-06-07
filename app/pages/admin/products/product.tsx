import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import z from "zod";

import { namespaces } from "~/constants/namespaces";
import { editNewProductAdmin, getProductAdmin } from "~/data/adminProduct";
import { requireAdminSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Product } from "~/models/product";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminProductEditPage = dynamic(() =>
  import("~/components/AdminProductEditPage").then(module => ({
    default: module.AdminProductEditPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminProductEdit],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          product: Z_Product,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN_SUPER]}>
            <AdminProductEditPage product={data.product} />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
      userRoles: [E_RolesServer.ADMIN_SUPER],
    });

    return await getProductAdmin({
      productId: params?.productId,
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
    });

    switch (request.method) {
      case E_Requests.post: {
        return await editNewProductAdmin({
          productId: params?.productId,
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

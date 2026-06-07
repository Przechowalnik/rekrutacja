import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import {
  checkIfCanCreateNewProduct,
  createNewProductAdmin,
} from "~/data/adminProduct";
import { requireAdminSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AdminProductNewPage = dynamic(() =>
  import("~/components/AdminProductNewPage").then(module => ({
    default: module.AdminProductNewPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminProductNew],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser userRoles={[E_Roles.ADMIN_SUPER]}>
        <AdminProductNewPage />
      </RespectUser>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
      userRoles: [E_RolesServer.ADMIN_SUPER],
    });

    return await checkIfCanCreateNewProduct({
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
    });

    switch (request.method) {
      case E_Requests.post: {
        return await createNewProductAdmin({
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

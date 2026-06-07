import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { createNewExchangeAdmin } from "~/data/adminExchange.server";
import { requireAdminSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AdminExchangeNewPage = dynamic(() =>
  import("~/components/AdminExchangeNewPage").then(module => ({
    default: module.AdminExchangeNewPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminExchangeNew],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser userRoles={[E_Roles.ADMIN_SUPER]}>
        <AdminExchangeNewPage />
      </RespectUser>
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
        return await createNewExchangeAdmin({
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
    await requireAdminSession({
      request,
    });

    return null;
  } catch (error) {
    return responseThrowError({ error });
  }
};

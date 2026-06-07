import type { ActionFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { deleteUserAccount } from "~/data/accountDelete.server";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AccountDeletePage = dynamic(() =>
  import("~/components/AccountDeletePage").then(module => ({
    default: module.AccountDeletePage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountDelete],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser
        respectUserEmailVerification={false}
        userRoles={[E_Roles.USER]}
      >
        <AccountDeletePage />
      </RespectUser>
    </RespectLocalization>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
      userRoles: [E_RolesServer.USER],
    });

    if (request.method === E_Requests.delete) {
      return await deleteUserAccount({ request, userId, userSessionVersion });
    }

    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
}

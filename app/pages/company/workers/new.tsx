import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import { signUp } from "~/data/authSignup.server";
import { checkIfUserCanCreateWorkerAccount } from "~/data/companyWorkers.server";
import { E_Requests } from "~/data/formRequests.server";
import {
  E_CompanyWorkerPermissionsServer,
  E_RolesServer,
} from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_CompanyWorkerPermissions, E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const CompanyWorkerNewPage = dynamic(() =>
  import("~/components/CompanyWorkerNewPage").then(module => ({
    default: module.CompanyWorkerNewPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [
    namespaces.companyWorkerNew,
    namespaces.registrationAccount,
  ],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser
        respectCompany
        userCompanyPermissions={[E_CompanyWorkerPermissions.MANAGE_WORKERS]}
        userRoles={[E_Roles.B2B_OWNER, E_Roles.B2B_WORKER]}
      >
        <CompanyWorkerNewPage />
      </RespectUser>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        request,
        respectCompany: true,
        userCompanyPermissions: [
          E_CompanyWorkerPermissionsServer.MANAGE_WORKERS,
        ],
        userRoles: [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
      });

    return await checkIfUserCanCreateWorkerAccount({
      request,
      userCompanyId,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userCompanyId, userId } = await requireUserSession({
      request,
      respectCompany: true,
      userCompanyPermissions: [E_CompanyWorkerPermissionsServer.MANAGE_WORKERS],
      userRoles: [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
    });

    if (request.method === E_Requests.post) {
      return await signUp({
        isCompanyWorkerRegistration: true,
        request,
        userCompanyId: userCompanyId ?? undefined,
        userId,
      });
    }

    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
}

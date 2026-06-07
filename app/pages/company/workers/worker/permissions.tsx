import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import { updateCompanyWorkerPermissions } from "~/data/companyWorkerPermissions.server";
import { getCompanyWorker } from "~/data/companyWorkers.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_CompanyWorker } from "~/models/company/companyWorker";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const CompanyWorkerPermissionsPage = dynamic(() =>
  import("~/components/CompanyWorkerPermissionsPage").then(module => ({
    default: module.CompanyWorkerPermissionsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyWorkerPermissions],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          companyWorker: Z_CompanyWorker,
        })}
      >
        {() => (
          <RespectUser
            respectCompany
            respectCompanyWorkerId
            userRoles={[E_Roles.B2B_OWNER]}
            workerCompanyRoles={[E_Roles.B2B_WORKER]}
          >
            <CompanyWorkerPermissionsPage />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    const { companyWorkerId, userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        params,
        request,
        respectCompany: true,
        respectCompanyWorkerId: true,
        userRoles: [E_RolesServer.B2B_OWNER],
        workerCompanyRoles: [E_RolesServer.B2B_WORKER],
      });

    if (request.method === E_Requests.patch) {
      return await updateCompanyWorkerPermissions({
        companyWorkerId,
        request,
        userCompanyId,
        userId,
        userSessionVersion,
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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const { companyWorkerId, userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        params,
        request,
        respectCompany: true,
        respectCompanyWorkerId: true,
        userRoles: [E_RolesServer.B2B_OWNER],
        workerCompanyRoles: [E_RolesServer.B2B_WORKER],
      });

    return await getCompanyWorker({
      companyWorkerId,
      request,
      userCompanyId,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import { deleteCompanyWorkerAccount } from "~/data/companyWorkerDelete.server";
import { getCompanyWorker } from "~/data/companyWorkers.server";
import { E_Requests } from "~/data/formRequests.server";
import {
  E_CompanyWorkerPermissionsServer,
  E_RolesServer,
} from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_CompanyWorker } from "~/models/company/companyWorker";
import { E_CompanyWorkerPermissions, E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const CompanyWorkerDeletePage = dynamic(() =>
  import("~/components/CompanyWorkerDeletePage").then(module => ({
    default: module.CompanyWorkerDeletePage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyWorkerDelete],
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
            userCompanyPermissions={[E_CompanyWorkerPermissions.MANAGE_WORKERS]}
            userRoles={[E_Roles.B2B_OWNER, E_Roles.B2B_WORKER]}
            workerCompanyRoles={[E_Roles.B2B_WORKER]}
          >
            <CompanyWorkerDeletePage />
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
        userCompanyPermissions: [
          E_CompanyWorkerPermissionsServer.MANAGE_WORKERS,
        ],
        userRoles: [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
        workerCompanyRoles: [E_RolesServer.B2B_WORKER],
      });

    if (request.method === E_Requests.delete) {
      return await deleteCompanyWorkerAccount({
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
        userCompanyPermissions: [
          E_CompanyWorkerPermissionsServer.MANAGE_WORKERS,
        ],
        userRoles: [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
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

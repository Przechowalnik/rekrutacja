import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import {
  addAvatarCompanyWorkerProfile,
  deleteAvatarCompanyWorkerProfile,
  updateCompanyWorkerProfile,
} from "~/data/companyWorkerProfile.server";
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

const CompanyWorkerProfilePage = dynamic(() =>
  import("~/components/CompanyWorkerProfilePage").then(module => ({
    default: module.CompanyWorkerProfilePage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyWorkerProfile],
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
            skipsPermissionsIfUserIsCompanyWorker
            userCompanyPermissions={[E_CompanyWorkerPermissions.MANAGE_WORKERS]}
            workerCompanyRoles={[E_Roles.B2B_WORKER, E_Roles.B2B_OWNER]}
          >
            <CompanyWorkerProfilePage />
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
      });

    switch (request.method) {
      case E_Requests.patch: {
        return await updateCompanyWorkerProfile({
          companyWorkerId,
          request,
          userCompanyId,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.post: {
        return await addAvatarCompanyWorkerProfile({
          companyWorkerId,
          request,
          userCompanyId,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.delete: {
        return await deleteAvatarCompanyWorkerProfile({
          companyWorkerId,
          request,
          userCompanyId,
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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const { companyWorkerId, userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        params,
        request,
        respectCompany: true,
        respectCompanyWorkerId: true,
        skipsPermissionsIfUserIsCompanyWorker: true,
        userCompanyPermissions: [
          E_CompanyWorkerPermissionsServer.MANAGE_WORKERS,
        ],
        workerCompanyRoles: [E_RolesServer.B2B_WORKER, E_RolesServer.B2B_OWNER],
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

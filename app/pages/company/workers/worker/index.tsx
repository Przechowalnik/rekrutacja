import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import { getCompanyWorker } from "~/data/companyWorkers.server";
import { E_CompanyWorkerPermissionsServer } from "~/data/models.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_CompanyWorker } from "~/models/company/companyWorker";
import { E_CompanyWorkerPermissions } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const CompanyWorkerPage = dynamic(() =>
  import("~/components/CompanyWorkerPage").then(module => ({
    default: module.CompanyWorkerPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyWorker],
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
          >
            <CompanyWorkerPage />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
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

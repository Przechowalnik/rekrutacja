import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import { getCompanyWorkers } from "~/data/companyWorkers.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_CompanyWorkers } from "~/models/company/companyWorkers";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const CompanyWorkersPage = dynamic(() =>
  import("~/components/CompanyWorkersPage").then(module => ({
    default: module.CompanyWorkersPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyWorkers],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          companyWorkers: Z_CompanyWorkers,
        })}
      >
        {data => (
          <RespectUser respectCompany>
            <CompanyWorkersPage companyWorkers={data.companyWorkers} />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        request,
        respectCompany: true,
      });

    return await getCompanyWorkers({
      request,
      userCompanyId,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

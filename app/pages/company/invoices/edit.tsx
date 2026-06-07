import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import {
  getCompanyInvoiceData,
  updateCompanyInvoiceData,
} from "~/data/companyInvoices.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_CompanyInvoiceData } from "~/models/company/companyInvoiceData";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const CompanyInvoiceEditPage = dynamic(() =>
  import("~/components/CompanyInvoiceEditPage").then(module => ({
    default: module.CompanyInvoiceEditPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyInvoiceEdit],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          companyInvoiceData: Z_CompanyInvoiceData,
        })}
      >
        {data => (
          <RespectUser respectCompany userRoles={[E_Roles.B2B_OWNER]}>
            <CompanyInvoiceEditPage
              companyInvoiceData={data.companyInvoiceData}
            />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
      respectCompany: true,
      userRoles: [E_RolesServer.B2B_OWNER],
    });
    return await getCompanyInvoiceData({ request, userId, userSessionVersion });
  } catch (error) {
    return responseThrowError({ error });
  }
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
      respectCompany: true,
      userRoles: [E_RolesServer.B2B_OWNER],
    });

    switch (request.method) {
      case E_Requests.patch: {
        return await updateCompanyInvoiceData({
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

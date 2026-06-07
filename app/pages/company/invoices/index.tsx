import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import {
  getCompanyInvoices,
  sendCompanyInvoiceToEmail,
} from "~/data/companyInvoices.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_CompanyInvoiceData } from "~/models/company/companyInvoiceData";
import { E_Roles } from "~/models/enums";
import { Z_Invoices } from "~/models/invoices";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const CompanyInvoicesPage = dynamic(() =>
  import("~/components/CompanyInvoicesPage").then(module => ({
    default: module.CompanyInvoicesPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyInvoices],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          companyInvoiceData: Z_CompanyInvoiceData,
          invoices: Z_Invoices,
          nextPage: z.number().nullable(),
          totalPages: z.number().optional().nullable(),
          totalResults: z.number(),
        })}
      >
        {data => (
          <RespectUser respectCompany userRoles={[E_Roles.B2B_OWNER]}>
            <CompanyInvoicesPage
              companyInvoiceData={data.companyInvoiceData}
              invoices={data.invoices}
              nextPage={data.nextPage}
              totalPages={data.totalPages}
              totalResults={data.totalResults}
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
    return await getCompanyInvoices({ request, userId, userSessionVersion });
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
      case E_Requests.post: {
        return await sendCompanyInvoiceToEmail({
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

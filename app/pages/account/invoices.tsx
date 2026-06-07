import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import {
  getAccountInvoices,
  sendAccountInvoiceToEmail,
} from "~/data/accountInvoices.server";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Invoices } from "~/models/invoices";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AccountInvoicesPage = dynamic(() =>
  import("~/components/AccountInvoicesPage").then(module => ({
    default: module.AccountInvoicesPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountInvoices],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          invoices: Z_Invoices,
          nextPage: z.number().nullable(),
          totalPages: z.number().optional().nullable(),
          totalResults: z.number(),
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.USER]}>
            <AccountInvoicesPage
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
      userRoles: [E_RolesServer.USER],
    });
    return await getAccountInvoices({ request, userId, userSessionVersion });
  } catch (error) {
    return responseThrowError({ error });
  }
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
      userRoles: [E_RolesServer.USER],
    });

    switch (request.method) {
      case E_Requests.post: {
        return await sendAccountInvoiceToEmail({
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

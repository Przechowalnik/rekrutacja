import type { ActionFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import {
  confirmCompanyNewPhone,
  deleteNewPhoneCompanyToConfirm,
  getCompanySMSToVerifiedPhone,
  updateCompanyPhone,
} from "~/data/companyPhone.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const CompanyPhonePage = dynamic(() =>
  import("~/components/CompanyPhonePage").then(module => ({
    default: module.CompanyPhonePage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyPhone],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser respectCompany userRoles={[E_Roles.B2B_OWNER]}>
        <CompanyPhonePage />
      </RespectUser>
    </RespectLocalization>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
      respectCompany: true,
      userRoles: [E_RolesServer.B2B_OWNER],
    });

    switch (request.method) {
      case E_Requests.patch: {
        return await updateCompanyPhone({
          request,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.post: {
        return await getCompanySMSToVerifiedPhone({
          request,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.put: {
        return await confirmCompanyNewPhone({
          request,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.delete: {
        return await deleteNewPhoneCompanyToConfirm({
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

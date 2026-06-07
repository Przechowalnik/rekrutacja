import { ActionFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import {
  E_CompanyWorkerPermissionsServer,
  E_RolesServer,
} from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { createListing } from "~/data/reusableListings.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_CompanyWorkerPermissions, E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const ReusableListingsNewPage = dynamic(() =>
  import("~/components/ReusableListingsNewPage").then(module => ({
    default: module.ReusableListingsNewPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyListingsNew],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser
        respectCompany
        respectCompanyPhoneVerification
        userCompanyPermissions={[E_CompanyWorkerPermissions.MANAGE_LISTINGS]}
        userRoles={[E_Roles.B2B_OWNER, E_Roles.B2B_WORKER]}
      >
        <ReusableListingsNewPage isCompany />
      </RespectUser>
    </RespectLocalization>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        request,
        respectCompany: true,
        userCompanyPermissions: [
          E_CompanyWorkerPermissionsServer.MANAGE_LISTINGS,
        ],
        userRoles: [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
      });

    switch (request.method) {
      case E_Requests.post: {
        return await createListing({
          isCompany: true,
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

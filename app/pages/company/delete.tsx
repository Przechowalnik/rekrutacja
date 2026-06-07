import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import { deleteCompanyAccount } from "~/data/companyDelete.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const CompanyDeletePage = dynamic(() =>
  import("~/components/CompanyDeletePage").then(module => ({
    default: module.CompanyDeletePage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyDelete],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser
        respectCompany
        respectCompanyPhoneVerificationWhenIsAddedRespectCompany={false}
        respectUserEmailVerification={false}
        userRoles={[E_Roles.B2B_OWNER]}
      >
        <CompanyDeletePage />
      </RespectUser>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await requireUserSession({
      request,
      respectCompany: true,
      userRoles: [E_RolesServer.B2B_OWNER],
    });

    return null;
  } catch (error) {
    return responseThrowError({ error });
  }
};

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    const { userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        params,
        request,
        respectCompany: true,
        userRoles: [E_RolesServer.B2B_OWNER],
      });

    if (request.method === E_Requests.delete) {
      return await deleteCompanyAccount({
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

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import { updateCompanySettings } from "~/data/companySettings.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const CompanySettingsPage = dynamic(() =>
  import("~/components/CompanySettingsPage").then(module => ({
    default: module.CompanySettingsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companySettings],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser respectCompany userRoles={[E_Roles.B2B_OWNER]}>
        <CompanySettingsPage />
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

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        request,
        respectCompany: true,
        userRoles: [E_RolesServer.B2B_OWNER],
      });

    switch (request.method) {
      case E_Requests.patch: {
        return await updateCompanySettings({
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

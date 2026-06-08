import { ActionFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { createListing } from "~/data/reusableListings.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const ReusableListingsNewPage = dynamic(() =>
  import("~/components/ReusableListingsNewPage").then(module => ({
    default: module.ReusableListingsNewPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountListingsNew],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser
        redirectOnError={E_Routes.accountPhone}
        userRoles={[E_Roles.USER]}
      >
        <ReusableListingsNewPage isCompany={false} />
      </RespectUser>
    </RespectLocalization>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
      userRoles: [E_RolesServer.USER],
    });

    switch (request.method) {
      case E_Requests.post: {
        return await createListing({
          isCompany: false,
          request,
          userCompanyId: undefined,
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

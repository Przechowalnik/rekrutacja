import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import {
  deleteCompanyCard,
  updateCompanyCard,
} from "~/data/companyCard.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectNotFreeListings } from "~/ui/RespectNotFreeListings";
import { RespectStripe } from "~/ui/RespectStripe";
import { RespectUser } from "~/ui/RespectUser";

const CompanyCardPage = dynamic(() =>
  import("~/components/CompanyCardPage").then(module => ({
    default: module.CompanyCardPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyCard],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectNotFreeListings>
        <RespectUser respectCompany userRoles={[E_Roles.B2B_OWNER]}>
          <RespectStripe>
            <CompanyCardPage />
          </RespectStripe>
        </RespectUser>
      </RespectNotFreeListings>
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
    const { userId, userSessionVersion } = await requireUserSession({
      request,
      respectCompany: true,
      userRoles: [E_RolesServer.B2B_OWNER],
    });

    switch (request.method) {
      case E_Requests.post: {
        return await updateCompanyCard({ request, userId, userSessionVersion });
      }
      case E_Requests.delete: {
        return await deleteCompanyCard({ request, userId, userSessionVersion });
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

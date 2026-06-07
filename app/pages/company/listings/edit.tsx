import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import z from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import {
  E_CompanyWorkerPermissionsServer,
  E_RolesServer,
} from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import {
  deleteListing,
  getReusableListing,
  updateListing,
} from "~/data/reusableListings.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_CompanyWorkerPermissions, E_Roles } from "~/models/enums";
import { Z_Listing } from "~/models/listing";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const ReusableListingsEditPage = dynamic(() =>
  import("~/components/ReusableListingsEditPage").then(module => ({
    default: module.ReusableListingsEditPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyListingsEdit],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          listing: Z_Listing,
        })}
      >
        {data => (
          <RespectUser
            respectCompany
            respectCompanyPhoneVerification
            userCompanyPermissions={[
              E_CompanyWorkerPermissions.MANAGE_LISTINGS,
            ]}
            userRoles={[E_Roles.B2B_OWNER, E_Roles.B2B_WORKER]}
          >
            <ReusableListingsEditPage isCompany listing={data.listing} />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
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

    return await getReusableListing({
      isCompany: true,
      listingIdOrSlug: params?.listingIdOrSlug,
      request,
      userCompanyId,
      userId,
      userSessionVersion,
      withPlatformProduct: false,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

export async function action({ params, request }: ActionFunctionArgs) {
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
        return await updateListing({
          isCompany: true,
          listingIdOrSlug: params?.listingIdOrSlug,
          request,
          userCompanyId,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.delete: {
        return await deleteListing({
          isCompany: true,
          listingIdOrSlug: params?.listingIdOrSlug,
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

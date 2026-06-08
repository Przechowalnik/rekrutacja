import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import z from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import {
  deleteListing,
  getReusableListing,
  updateListing,
} from "~/data/reusableListings.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
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
  extraNamespaces: [namespaces.accountListingsEdit],
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
          <RespectUser userRoles={[E_Roles.USER]}>
            <ReusableListingsEditPage
              isCompany={false}
              listing={data.listing}
            />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
      userRoles: [E_RolesServer.USER],
    });

    return await getReusableListing({
      isCompany: false,
      listingIdOrSlug: params?.listingIdOrSlug,
      request,
      userCompanyId: undefined,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
      userRoles: [E_RolesServer.USER],
    });

    switch (request.method) {
      case E_Requests.post: {
        return await updateListing({
          isCompany: false,
          listingIdOrSlug: params?.listingIdOrSlug,
          request,
          userCompanyId: undefined,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.delete: {
        return await deleteListing({
          isCompany: false,
          listingIdOrSlug: params?.listingIdOrSlug,
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

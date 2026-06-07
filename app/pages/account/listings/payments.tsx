import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import z from "zod";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { requireUserSession } from "~/data/auth.server";
import { isFreeListingsServer } from "~/data/flags.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_ListingStatusServer, E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import {
  extensionFreeListingListing,
  extensionListing,
  getReusableListing,
} from "~/data/reusableListings.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Listing } from "~/models/listing";
import { Z_Product } from "~/models/product";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const ReusableListingsPaymentsPage = dynamic(() =>
  import("~/components/ReusableListingsPaymentsPage").then(module => ({
    default: module.ReusableListingsPaymentsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountListingsPayments],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          listing: Z_Listing,
          product: Z_Product,
        })}
      >
        {data => (
          <RespectUser
            redirectOnError={E_Routes.accountPhone}
            respectUserPhoneVerification
            userRoles={[E_Roles.USER]}
          >
            <ReusableListingsPaymentsPage
              isCompany={false}
              listing={data.listing}
              product={data.product}
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
      status: [
        E_ListingStatusServer.ACTIVE,
        E_ListingStatusServer.EXPIRED,
        E_ListingStatusServer.INACTIVE,
        E_ListingStatusServer.UNPAID,
      ],
      userCompanyId: undefined,
      userId,
      userSessionVersion,
      withPlatformProduct: true,
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
        return isFreeListingsServer()
          ? await extensionFreeListingListing({
              isCompany: false,
              listingIdOrSlug: params?.listingIdOrSlug,
              request,
              userCompanyId: undefined,
              userId,
              userSessionVersion,
            })
          : await extensionListing({
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

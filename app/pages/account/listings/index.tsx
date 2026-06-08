import { LoaderFunctionArgs } from "react-router";
import z from "zod";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { getListingsAccount } from "~/data/accountListings.server";
import { requireUserSession } from "~/data/auth.server";
import { E_RolesServer } from "~/data/models.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Listings } from "~/models/listings";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const ReusableListingsPage = dynamic(() =>
  import("~/components/ReusableListingsPage").then(module => ({
    default: module.ReusableListingsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountListings],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          listings: Z_Listings,
          nextPage: z.number().nullable(),
          totalPages: z.number().optional().nullable(),
        })}
      >
        {data => (
          <RespectUser
            redirectOnError={E_Routes.accountPhone}
            userRoles={[E_Roles.USER]}
          >
            <ReusableListingsPage
              isCompany={false}
              listings={data.listings}
              nextPage={data.nextPage}
              totalPages={data.totalPages}
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

    return await getListingsAccount({
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

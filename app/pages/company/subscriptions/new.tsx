import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import {
  checkCanUserCreateSubscription,
  checkSubscriptionCoupon,
  createNewSubscription,
} from "~/data/companySubscription.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { getPlans } from "~/data/publicPlans.server";
import {
  responseGetOnFailure,
  responseOnFailure,
  responseThrowError,
} from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Plans } from "~/models/plans";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectNotFreeListings } from "~/ui/RespectNotFreeListings";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectStripe } from "~/ui/RespectStripe";
import { RespectUser } from "~/ui/RespectUser";

const CompanySubscriptionNewPage = dynamic(() =>
  import("~/components/CompanySubscriptionNewPage").then(module => ({
    default: module.CompanySubscriptionNewPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companySubscriptionNew],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectNotFreeListings>
        <RespectSchema
          schema={z.object({
            plans: Z_Plans,
          })}
        >
          {data => (
            <RespectUser respectCompany userRoles={[E_Roles.B2B_OWNER]}>
              <RespectStripe>
                <CompanySubscriptionNewPage plans={data.plans} />
              </RespectStripe>
            </RespectUser>
          )}
        </RespectSchema>
      </RespectNotFreeListings>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        request,
        respectCompany: true,
        userRoles: [E_RolesServer.B2B_OWNER],
      });

    const userCanCreateSubscription = await checkCanUserCreateSubscription({
      request,
      userCompanyId,
      userId,
      userSessionVersion,
    });

    if (!userCanCreateSubscription) {
      const redirectOnError = await responseGetOnFailure({ request });
      return redirectOnError;
    }

    return await getPlans({ request });
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
      case E_Requests.put: {
        return await checkSubscriptionCoupon({
          request,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.post: {
        return createNewSubscription({
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

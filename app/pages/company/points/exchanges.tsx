import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import {
  exchangePointsToSubscription,
  getExchangesCompany,
} from "~/data/companyExchange.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Exchanges } from "~/models/exchanges";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectNotFreeListings } from "~/ui/RespectNotFreeListings";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const CompanyPointsExchangesPage = dynamic(() =>
  import("~/components/CompanyPointsExchangesPage").then(module => ({
    default: module.CompanyPointsExchangesPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyPointsExchanges],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectNotFreeListings>
        <RespectSchema
          schema={z.object({
            exchanges: Z_Exchanges,
          })}
        >
          {data => (
            <RespectUser respectCompany userRoles={[E_Roles.B2B_OWNER]}>
              <CompanyPointsExchangesPage exchanges={data.exchanges} />
            </RespectUser>
          )}
        </RespectSchema>
      </RespectNotFreeListings>
    </RespectLocalization>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
      respectCompany: true,
      userRoles: [E_RolesServer.B2B_OWNER],
    });

    switch (request.method) {
      case E_Requests.patch: {
        return await exchangePointsToSubscription({
          request,
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await requireUserSession({
      request,
      respectCompany: true,
      userRoles: [E_RolesServer.B2B_OWNER],
    });

    return await getExchangesCompany({ request });
  } catch (error) {
    return responseThrowError({ error });
  }
};

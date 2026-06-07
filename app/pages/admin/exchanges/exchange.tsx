import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import {
  deleteExchangeAdmin,
  getExchangeAdmin,
  updateExchangeAdmin,
} from "~/data/adminExchange.server";
import { requireAdminSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Exchange } from "~/models/exchange";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminExchangeEditPage = dynamic(() =>
  import("~/components/AdminExchangeEditPage").then(module => ({
    default: module.AdminExchangeEditPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminExchangeEdit],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          exchange: Z_Exchange,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN_SUPER]}>
            <AdminExchangeEditPage exchange={data.exchange} />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
      userRoles: [E_RolesServer.ADMIN_SUPER],
    });

    switch (request.method) {
      case E_Requests.patch: {
        return await updateExchangeAdmin({
          request,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.delete: {
        return await deleteExchangeAdmin({
          exchangeId: params?.exchangeId,
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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
    });

    return await getExchangeAdmin({
      exchangeId: params?.exchangeId,
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

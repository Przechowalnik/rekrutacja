import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { createNewCouponAdmin } from "~/data/adminCoupons.server";
import { getPlansAdmin } from "~/data/adminPlan.server";
import { requireAdminSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_Plans } from "~/models/plans";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminCouponNewPage = dynamic(() =>
  import("~/components/AdminCouponNewPage").then(module => ({
    default: module.AdminCouponNewPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminCouponNew],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          plans: Z_Plans,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN, E_Roles.ADMIN_SUPER]}>
            <AdminCouponNewPage plans={data.plans} />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
    });

    switch (request.method) {
      case E_Requests.post: {
        return await createNewCouponAdmin({
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
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
    });

    return await getPlansAdmin({
      request,
      userId,
      userSessionVersion,
      withoutTrial: true,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

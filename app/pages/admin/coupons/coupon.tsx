import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import {
  deleteCouponAdmin,
  getCouponAdmin,
  updateCouponAdmin,
} from "~/data/adminCoupons.server";
import { requireAdminSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_Coupon } from "~/models/coupon";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminCouponEditPage = dynamic(() =>
  import("~/components/AdminCouponEditPage").then(module => ({
    default: module.AdminCouponEditPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminCouponEdit],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          coupon: Z_Coupon,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN, E_Roles.ADMIN_SUPER]}>
            <AdminCouponEditPage coupon={data.coupon} />
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
      case E_Requests.patch: {
        return await updateCouponAdmin({ request, userId, userSessionVersion });
      }
      case E_Requests.delete: {
        return await deleteCouponAdmin({ request, userId, userSessionVersion });
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

    return await getCouponAdmin({
      couponId: params?.couponId,
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

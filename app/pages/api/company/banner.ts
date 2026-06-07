import { ActionFunctionArgs } from "react-router";

import { requireUserSession } from "~/data/auth.server";
import {
  addBannerCompanyProfile,
  deleteBannerCompanyProfile,
} from "~/data/companyBanner.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        request,
        respectCompany: true,
        userRoles: [E_RolesServer.B2B_OWNER],
      });

    switch (request.method) {
      case E_Requests.post: {
        return await addBannerCompanyProfile({
          request,
          userCompanyId,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.delete: {
        return await deleteBannerCompanyProfile({
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

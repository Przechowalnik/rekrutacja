import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import {
  addAvatarCompanyProfile,
  deleteAvatarCompanyProfile,
  getCompanyProfile,
} from "~/data/companyProfile.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_CompanyProfile } from "~/models/company/companyProfile";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const CompanyProfilePage = dynamic(() =>
  import("~/components/CompanyProfilePage").then(module => ({
    default: module.CompanyProfilePage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyProfile],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          companyProfile: Z_CompanyProfile,
        })}
      >
        {data => (
          <RespectUser respectCompany userRoles={[E_Roles.B2B_OWNER]}>
            <CompanyProfilePage companyProfile={data.companyProfile} />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

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
        return await addAvatarCompanyProfile({
          request,
          userCompanyId,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.delete: {
        return await deleteAvatarCompanyProfile({
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
      respectCompany: true,
      userRoles: [E_RolesServer.B2B_OWNER],
    });

    return await getCompanyProfile({
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

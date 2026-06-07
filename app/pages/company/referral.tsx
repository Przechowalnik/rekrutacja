import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import {
  createCompanyReferral,
  getCompanyReferralPlatformSettings,
} from "~/data/companyReferral.server";
import { E_Requests } from "~/data/formRequests.server";
import { E_RolesServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { Z_PlatformSetting } from "~/models/platformSetting";
import { Z_Referral } from "~/models/referral";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const CompanyReferralPage = dynamic(() =>
  import("~/components/CompanyReferralPage").then(module => ({
    default: module.CompanyReferralPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyReferral],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          platformSetting: Z_PlatformSetting,
          referral: Z_Referral.nullable(),
        })}
      >
        {data => (
          <RespectUser
            respectCompany
            userRoles={[E_Roles.B2B_OWNER, E_Roles.B2B_WORKER]}
          >
            <CompanyReferralPage
              platformSetting={data.platformSetting}
              referral={data.referral}
            />
          </RespectUser>
        )}
      </RespectSchema>
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
      case E_Requests.post: {
        return await createCompanyReferral({
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
    const { userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        request,
        respectCompany: true,
        userRoles: [E_RolesServer.B2B_OWNER, E_RolesServer.B2B_WORKER],
      });

    return await getCompanyReferralPlatformSettings({
      request,
      userCompanyId,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

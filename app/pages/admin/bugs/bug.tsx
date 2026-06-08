import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { getBugAdmin } from "~/data/adminBug.server";
import { requireAdminSession } from "~/data/auth.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_Bug } from "~/models/bug";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const ReusableBugDetailsPage = dynamic(() =>
  import("~/components/ReusableBugDetailsPage").then(module => ({
    default: module.ReusableBugDetailsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountBugDetails],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          bug: Z_Bug,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN, E_Roles.ADMIN_SUPER]}>
            <ReusableBugDetailsPage bug={data.bug} isAdmin />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
    });

    return await getBugAdmin({
      bugId: params?.bugId,
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

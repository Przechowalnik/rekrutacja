import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { requireUserSession } from "~/data/auth.server";
import { getBugsCompany } from "~/data/companyBug.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_Bugs } from "~/models/bugs";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const ReusableBugsPage = dynamic(() =>
  import("~/components/ReusableBugsPage").then(module => ({
    default: module.ReusableBugsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.companyBugs],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          bugs: Z_Bugs,
        })}
      >
        {data => (
          <RespectUser respectCompany>
            <ReusableBugsPage bugs={data.bugs} isCompany />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { userCompanyId, userId, userSessionVersion } =
      await requireUserSession({
        request,
        respectCompany: true,
      });

    return await getBugsCompany({
      request,
      userCompanyId,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

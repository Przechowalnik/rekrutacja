import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { getBugAccount } from "~/data/accountBug.server";
import { requireUserSession } from "~/data/auth.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_Bug } from "~/models/bug";
import { Z_PlatformSetting } from "~/models/platformSetting";
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
          platformSetting: Z_PlatformSetting,
        })}
      >
        {data => (
          <RespectUser>
            <ReusableBugDetailsPage
              bug={data.bug}
              platformSetting={data.platformSetting}
            />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
    });

    return await getBugAccount({
      bugId: params?.bugId,
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

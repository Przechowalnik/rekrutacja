import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import {
  getAccountConsents,
  updateUserConsents,
} from "~/data/accountConsents.server";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_UserConsent } from "~/models/userSession/userConsent";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AccountConsentsPage = dynamic(() =>
  import("~/components/AccountConsentsPage").then(module => ({
    default: module.AccountConsentsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountConsents],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          userConsent: Z_UserConsent,
        })}
      >
        {data => (
          <RespectUser>
            <AccountConsentsPage userConsent={data.userConsent} />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
    });

    return await getAccountConsents({
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
    });

    switch (request.method) {
      case E_Requests.patch: {
        return await updateUserConsents({
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

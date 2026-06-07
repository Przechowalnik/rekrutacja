import type { ActionFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { updateUserAuthenticator } from "~/data/accountAuthenticator.server";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AccountAuthenticatorPage = dynamic(() =>
  import("~/components/AccountAuthenticatorPage").then(module => ({
    default: module.AccountAuthenticatorPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountAuthenticator],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser>
        <AccountAuthenticatorPage />
      </RespectUser>
    </RespectLocalization>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
    });

    switch (request.method) {
      case E_Requests.patch: {
        return await updateUserAuthenticator({
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

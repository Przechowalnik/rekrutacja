import type { ActionFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { updateUserPassword } from "~/data/accountPassword.server";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AccountPasswordPage = dynamic(() =>
  import("~/components/AccountPasswordPage").then(module => ({
    default: module.AccountPasswordPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountPassword],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser>
        <AccountPasswordPage />
      </RespectUser>
    </RespectLocalization>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
    });

    if (request.method === E_Requests.patch) {
      return await updateUserPassword({ request, userId, userSessionVersion });
    }

    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
}

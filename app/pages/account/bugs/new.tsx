import type { ActionFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { createAccountBug } from "~/data/accountBug.server";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AccountBugNewPage = dynamic(() =>
  import("~/components/AccountBugNewPage").then(module => ({
    default: module.AccountBugNewPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountBugNew],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser>
        <AccountBugNewPage />
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
      case E_Requests.post: {
        return await createAccountBug({ request, userId, userSessionVersion });
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

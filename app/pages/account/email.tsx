import type { ActionFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import {
  confirmCodeUserEmail,
  sendAgainCodeUserEmail,
  updateUserEmail,
} from "~/data/accountEmail.server";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AccountEmailPage = dynamic(() =>
  import("~/components/AccountEmailPage").then(module => ({
    default: module.AccountEmailPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountEmail],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser>
        <AccountEmailPage />
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
        return await updateUserEmail({ request, userId, userSessionVersion });
      }
      case E_Requests.post: {
        return await sendAgainCodeUserEmail({
          request,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.put: {
        return await confirmCodeUserEmail({
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

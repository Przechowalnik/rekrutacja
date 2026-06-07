import type { ActionFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import {
  confirmUserNewPhone,
  deleteNewPhoneUserToConfirm,
  getUserSMSToVerifiedPhone,
  updateUserPhone,
} from "~/data/accountPhone.server";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AccountPhonePage = dynamic(() =>
  import("~/components/AccountPhonePage").then(module => ({
    default: module.AccountPhonePage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountPhoneNumber],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser>
        <AccountPhonePage />
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
        return await updateUserPhone({ request, userId, userSessionVersion });
      }
      case E_Requests.post: {
        return await getUserSMSToVerifiedPhone({
          request,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.put: {
        return await confirmUserNewPhone({
          request,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.delete: {
        return await deleteNewPhoneUserToConfirm({
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

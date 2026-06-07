import type { ActionFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import {
  addAvatarUserProfile,
  deleteAvatarUserProfile,
  updateUserProfile,
} from "~/data/accountProfile.server";
import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AccountProfilePage = dynamic(() =>
  import("~/components/AccountProfilePage").then(module => ({
    default: module.AccountProfilePage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountProfile],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser>
        <AccountProfilePage />
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
        return await updateUserProfile({ request, userId, userSessionVersion });
      }
      case E_Requests.post: {
        return await addAvatarUserProfile({
          request,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.delete: {
        return await deleteAvatarUserProfile({
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

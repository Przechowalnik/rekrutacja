import type { ActionFunctionArgs } from "react-router";

import { E_Routes } from "~/constants/routes";
import { confirmRecoveryAccount } from "~/data/accountRecovery.server";
import { requireNoUserSession } from "~/data/auth.server";
import { destroyUserSession } from "~/data/authSession.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { isError } = await requireNoUserSession({
      onErrorThrowError: false,
      redirectPath: E_Routes.home,
      request,
    });

    if (isError) {
      return await destroyUserSession({
        isError,
        request,
        withRedirect: true,
      });
    }

    if (request.method === E_Requests.post) {
      return await confirmRecoveryAccount({ request });
    }

    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
}

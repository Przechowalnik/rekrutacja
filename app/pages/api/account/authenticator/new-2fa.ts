import { type LoaderFunctionArgs } from "react-router";

import { getUserNewAuthenticator2FA } from "~/data/accountAuthenticator.server";
import { requireUserSession } from "~/data/auth.server";
import { responseThrowError } from "~/data/response.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
    });
    return await getUserNewAuthenticator2FA({
      request,
      userId,
      userSessionVersion,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

import type { LoaderFunctionArgs } from "react-router";

import { getAuthenticatorEmailOTPCode } from "~/data/accountAuthenticator.server";
import { responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await applyRateLimit({ request });

    return await getAuthenticatorEmailOTPCode({
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

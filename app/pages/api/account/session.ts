import { type LoaderFunctionArgs } from "react-router";

import { getDataFromSession } from "~/data/accountSession.server";
import { responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await applyRateLimit({
      request,
    });

    return await getDataFromSession({
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

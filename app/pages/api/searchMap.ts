import type { LoaderFunctionArgs } from "react-router";

import { getListingsMap } from "~/data/home.server";
import { responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await applyRateLimit({ request });

    return await getListingsMap({
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

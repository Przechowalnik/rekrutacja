import { type LoaderFunctionArgs } from "react-router";

import { getLatestListings } from "~/data/home.server";
import { responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    await applyRateLimit({ request });

    return await getLatestListings({ request });
  } catch (error) {
    return responseThrowError({ error });
  }
}

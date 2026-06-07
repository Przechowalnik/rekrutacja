import type { LoaderFunction } from "react-router";

import { E_Routes } from "~/constants/routes";
import { auth } from "~/data/0auth2.server";
import { responseGetOnFailure } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";

export const loader: LoaderFunction = async ({ request }) => {
  const redirectOnError = await responseGetOnFailure({
    redirectPath: E_Routes.error,
    request,
  });

  try {
    await applyRateLimit({ request });

    return await auth.authenticate("google", request);
  } catch {
    return redirectOnError;
  }
};

import type { LoaderFunction } from "react-router";

import { auth } from "~/data/0auth2.server";

export const loader: LoaderFunction = async ({ request }) => {
  return await auth.authenticate("facebook", request);
};

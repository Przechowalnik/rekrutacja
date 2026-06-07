import { type LoaderFunctionArgs } from "react-router";

import { requireAdminSession } from "~/data/auth.server";
import { responseThrowError } from "~/data/response.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await requireAdminSession({
      request,
    });
    return null;
  } catch (error) {
    return responseThrowError({ error });
  }
};

import { LoaderFunctionArgs } from "react-router";

import { destroyUserSession } from "~/data/authSession.server";
import { responseThrowError } from "~/data/response.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    return await destroyUserSession({
      request,
      withRedirect: true,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

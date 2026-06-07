import { data } from "react-router";

import { getFlashMessageWithUserCookie } from "~/data/flashMessage.server";
import { responseThrowError } from "~/data/response.server";

export async function loader({ request }: { request: Request }) {
  try {
    const result = await getFlashMessageWithUserCookie(request);
    return data(result.data, { headers: result.headers });
  } catch (error) {
    return responseThrowError({ error });
  }
}

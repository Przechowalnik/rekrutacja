import { type ActionFunctionArgs } from "react-router";

import { signUpCompany } from "~/data/authSignup.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    await applyRateLimit({ request });

    if (request.method === E_Requests.post) {
      return await signUpCompany({ request });
    }

    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
}

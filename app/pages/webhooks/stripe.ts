import { type ActionFunctionArgs } from "react-router";

import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { stripeWebhook } from "~/data/stripeWebhook.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    if (request.method === E_Requests.post) {
      return await stripeWebhook({ request });
    }

    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
}

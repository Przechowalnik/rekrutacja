import { timingSafeEqual } from "node:crypto";

import { LoaderFunctionArgs } from "react-router";

import { updateCron } from "~/data/crone.server";

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : new URL(request.url).searchParams.get("token");

  if (!token || !constantTimeEqual(token, expected)) {
    return new Response("Unauthorized", { status: 401 });
  }

  return await updateCron();
};

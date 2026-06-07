import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const targetUrl = `https://www.google-analytics.com/g/collect${url.search}`;

  const response = await fetch(targetUrl, {
    headers: {
      "User-Agent": request.headers.get("user-agent") ?? "",
    },
    method: "GET",
  });

  return new Response(null, { status: response.status });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const targetUrl = `https://www.google-analytics.com/g/collect${url.search}`;

  const body = await request.text();

  const response = await fetch(targetUrl, {
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": request.headers.get("user-agent") ?? "",
    },
    method: "POST",
  });

  return new Response(null, { status: response.status });
};

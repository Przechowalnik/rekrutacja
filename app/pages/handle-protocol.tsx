import { LoaderFunctionArgs, useLoaderData } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const rawProtocolUrl = url.searchParams.get("url");

  return { rawProtocolUrl };
}

export default function HandleProtocolRoute() {
  const { rawProtocolUrl } = useLoaderData<typeof loader>();

  return (
    <main style={{ padding: 16 }}>
      <h1>Opening a link from the app</h1>
      {rawProtocolUrl ? (
        <p>
          Handled URL: <strong>{rawProtocolUrl}</strong>
        </p>
      ) : (
        <p>No protocol URL provided.</p>
      )}
    </main>
  );
}

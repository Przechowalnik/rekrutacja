import { getGtmScript } from "~/data/gtm.server";

export const loader = async () => {
  const js = await getGtmScript();

  return new Response(js, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "application/javascript",
    },
  });
};

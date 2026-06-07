import { data as dataResponse } from "react-router";

export const errorPageLoader = (status = 404) => {
  return dataResponse(null, {
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, follow",
    },
    status,
  });
};

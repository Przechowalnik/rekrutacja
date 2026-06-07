export const optimization = {
  cacheNoStore: {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Expires: "0",
    Pragma: "no-cache",
  },
  cacheStore: {
    "Cache-Control":
      "public, max-age=300, s-maxage=600, stale-while-revalidate=60",
    Expires: "0",
    Pragma: "no-cache",
    Vary: "Cookie",
  },
};

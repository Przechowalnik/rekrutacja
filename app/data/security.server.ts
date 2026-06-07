import { E_Routes } from "~/constants/routes";

import { environment } from "./environment.server";
import { getEncryptedIp } from "./ip.server";
import { logger } from "./logger.server";
import { client } from "./redis.server";
import { responseGetOnFailure } from "./response.server";

export async function rateLimit(ip: string, limit = 100, windowSeconds = 120) {
  try {
    const key = `ratelimit:${ip}`;

    const count = await client.eval(
      `
      local current = redis.call("INCR", KEYS[1])
      if current == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
      end
      return current
      `,
      [key],
      [windowSeconds],
    );

    if (Number(count) > limit) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Rate limit Redis error — blocking request (fail-closed)", {
      error,
    });
    return false;
  }
}

export async function applyRateLimit({
  forceBlankPage,
  forceBlock,
  request,
}: {
  forceBlankPage?: boolean;
  forceBlock?: boolean;
  request: Request;
}) {
  if (
    typeof process === "undefined" ||
    process.env.NODE_ENV !== "production" ||
    environment("LOCAL_ENV")?.toLowerCase() === "dev" ||
    environment("LOCAL_ENV")?.toLowerCase() === "preview"
  ) {
    return null;
  }

  const encryptedIp = getEncryptedIp({ request });
  const ok = await rateLimit(encryptedIp);

  if (!ok || forceBlock) {
    if (forceBlankPage) {
      throw Response.json(
        { error: "Too Many Requests" },
        {
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": "60",
          },
          status: 429,
        },
      );
    }

    throw responseGetOnFailure({
      flashData: {
        message: "rateLimitExceeded",
      },
      redirectPath: E_Routes.error,
      request,
    });
  }
}

import { Redis } from "@upstash/redis";

import { environment } from "./environment.server";
import { isE2E } from "./isE2E.server";

const localEnvironment = environment("LOCAL_ENV")?.toLowerCase();
const isDevelopment =
  isE2E ||
  localEnvironment === "dev" ||
  localEnvironment === "preview" ||
  process.env.NODE_ENV !== "production";

export const client = isDevelopment
  ? {
      del: async () => true,
      eval: async () => null,
      expire: async () => true,
      get: async () => null,
      incr: async () => 1,
      set: async () => true,
    }
  : new Redis({
      token: environment("UPSTASH_REDIS_TOKEN"),
      url: environment("UPSTASH_REDIS_URL"),
    });

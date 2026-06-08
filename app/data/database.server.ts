import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

import { PrismaClient } from "../../generated/prisma/client";
import { isE2E } from "./isE2E.server";

const isDevelopmentOrTests = () => {
  if (isE2E) {
    return true;
  }
  const localEnvironment = (process.env.LOCAL_ENV ?? "").toLowerCase();
  return localEnvironment === "dev" || localEnvironment === "test";
};

const baseUrl = process.env.DATABASE_URL;
if (!baseUrl && !isDevelopmentOrTests()) {
  throw new Error("DATABASE_URL is missing.");
}

// Build connection string with appropriate SSL settings.
// SSL is enabled without CA verification (no certificate required).
const connectionString = (() => {
  if (!baseUrl) {
    return "postgresql://localhost:5432/dummy";
  }

  const url = new URL(baseUrl);

  if (isE2E || !isDevelopmentOrTests()) {
    url.searchParams.set("sslmode", "no-verify");
  }

  return url.toString();
})();

const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const database =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter }).$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = database;
}

function gracefulShutdown() {
  void database.$disconnect();
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export { database };
